import * as fse from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { extensionState } from "../../extensionState";
import { leetCodeChannel } from "../../leetCodeChannel";
import { executeCommand } from "../../utils/cpUtils";
import { fileMeta, getEntryFile, randomString } from "../../utils/problemUtils";
import { IDebugConfig, IProblemType } from "../debugExecutor";
import problemTypes from "../problemTypes";

const debugConfig: IDebugConfig = {
    type: "cppdbg",
    MIMode: "gdb",
    setupCommands: [
        {
            description: "Enable pretty-printing for gdb",
            text: "-enable-pretty-printing",
            ignoreFailures: true,
        },
    ],
    miDebuggerPath: "gdb.exe",
};

class CppExecutor {
    public async execute(
        filePath: string,
        testString: string,
        language: string,
        port: number,
    ): Promise<string | undefined> {
        const sourceFileContent: string = (await fse.readFile(filePath)).toString();
        const meta: { id: string; lang: string } | null = fileMeta(sourceFileContent);
        if (meta == null) {
            vscode.window.showErrorMessage(
                "File meta info has been changed, please check the content: '@lc app=leetcode.cn id=xx lang=xx'.",
            );
            return;
        }
        const problemType: IProblemType = problemTypes[meta.id];
        if (problemType == null) {
            vscode.window.showErrorMessage(`Notsupported problem: ${meta.id}.`);
            return;
        }

        debugConfig.program = await getEntryFile(meta.lang, meta.id);

        const newSourceFileName: string = `source${language}problem${meta.id}.cpp`;
        const newSourceFilePath: string = path.join(extensionState.cachePath, newSourceFileName);

        // check whether module.exports is exist or not
        const moduleExportsReg: RegExp = /\/\/ @before-stub-for-debug-begin/;
        if (!moduleExportsReg.test(sourceFileContent)) {
            const newContent: string =
                `// @before-stub-for-debug-begin
#include <vector>
#include <string>
using namespace std;
// @before-stub-for-debug-end\n\n` + sourceFileContent;
            await fse.writeFile(filePath, newContent);

            // create source file for build because g++ does not support inlucde file with chinese name
            await fse.writeFile(newSourceFilePath, newContent);
        } else {
            await fse.writeFile(newSourceFilePath, sourceFileContent);
        }

        const params: string[] = testString.split("\\n");
        const paramsType: string[] = problemType.paramTypes;
        if (params.length !== paramsType.length) {
            vscode.window.showErrorMessage("Input parameters is not match the probleam!");
            return;
        }

        const indent: string = "    ";
        let insertCode: string = `vector<string> params{${params.map((p: string) => `"${p}"`).join(", ")}};\n`;
        const callArgs: string[] = [];
        paramsType.map((type: string, index: number) => {
            callArgs.push(`arg${index}`);

            insertCode += `
    string param${index} = params[${index}];
    cJSON *item${index} = cJSON_Parse(param${index}.c_str());
`;
            switch (type) {
                case "number":
                    insertCode += `${indent}int arg${index} = parseNumber(item${index});\n`;
                    break;
                case "number[]":
                    insertCode += `${indent}vector<int> arg${index} = parseNumberArray(item${index});\n`;
                    break;
                case "number[][]":
                    insertCode += `${indent}vector<vector<int>> arg${index} = parseNumberArrayArray(item${index});\n`;
                    break;
                case "string":
                    insertCode += `${indent}string arg${index} = parseString(item${index});\n`;
                    break;
                case "string[]":
                    insertCode += `${indent}vector<string> arg${index} = parseStringArray(item${index});\n`;
                    break;
                case "string[][]":
                    insertCode += `${indent}vector<vector<string>> arg${index} = parseStringArrayArray(item${index});\n`;
                    break;
                // case "ListNode":
                //     return parseListNode(param);
                // case "ListNode[]":
                //     return parseListNodeArray(param);
                case "character":
                    insertCode += `${indent}char arg${index} = parseCharacter(item${index});\n`;
                    break;
                case "character[]":
                    insertCode += `${indent}vector<char> arg${index} = parseCharacterArray(item${index});\n`;
                    break;
                case "character[][]":
                    insertCode += `${indent}vector<vector<char>> arg${index} = parseCharacterArrayArray(item${index});\n`;
                    break;
                // case "NestedInteger[]":
                //     return parseNestedIntegerArray(param);
                // case "MountainArray":
                //     return parseMountainArray(param);
                // case "TreeNode":
                //     return parseTreeNode(param);
            }
        });

        insertCode += `${indent}(new Solution())->${problemType.funName}(${callArgs.join(", ")});\n`;

        // insert include code and replace function namem
        const includeFileRegExp: RegExp = /\/\/ @@stub\-for\-include\-code@@/;
        const codeRegExp: RegExp = /\/\/ @@stub\-for\-body\-code@@/;
        const entryFile: string = debugConfig.program;
        const entryFileContent: string = (await fse.readFile(entryFile)).toString();
        const newEntryFileContent: string = entryFileContent
            .replace(includeFileRegExp, `#include "${newSourceFileName}"`)
            .replace(codeRegExp, insertCode);
        await fse.writeFile(entryFile, newEntryFileContent);

        const exePath: string = path.join(extensionState.cachePath, `${language}problem${meta.id}.exe`);

        const extDir: string = vscode.extensions.getExtension("wangtao0101.debug-leetcode")!.extensionPath;
        const thirdPartyPath: string = path.join(extDir, "src/debug/thirdparty/c");

        try {
            const includePath: string = path.dirname(exePath);
            await executeCommand("g++.exe -g", [
                `${debugConfig.program} -o ${exePath} -I ${includePath} -I ${thirdPartyPath}`,
            ]);
        } catch (e) {
            // vscode.window.showErrorMessage(e);
            leetCodeChannel.show();
            return;
        }

        debugConfig.program = exePath;
        debugConfig.cwd = extensionState.cachePath;
        // map build source file to user source file
        debugConfig.sourceFileMap = {
            [newSourceFilePath]: filePath,
        };

        const args: string[] = [
            filePath,
            testString.replace(/\\"/g, '\\\\"'),
            problemType.funName,
            problemType.paramTypes.join(","),
            problemType.returnType,
            meta.id,
            port.toString(),
        ];
        const debugSessionName: string = randomString(16);
        const debuging: boolean = await vscode.debug.startDebugging(
            undefined,
            Object.assign({}, debugConfig, {
                request: "launch",
                name: debugSessionName,
                args,
            }),
        );

        if (debuging) {
            const debugSessionDisposes: vscode.Disposable[] = [];

            vscode.debug.breakpoints.map((bp: vscode.SourceBreakpoint) => {
                if (bp.location.uri.fsPath === newSourceFilePath) {
                    vscode.debug.removeBreakpoints([bp]);
                }
            });

            vscode.debug.breakpoints.map((bp: vscode.SourceBreakpoint) => {
                if (bp.location.uri.fsPath === filePath) {
                    const location: vscode.Location = new vscode.Location(
                        vscode.Uri.file(newSourceFilePath),
                        bp.location.range,
                    );
                    vscode.debug.addBreakpoints([
                        new vscode.SourceBreakpoint(location, bp.enabled, bp.condition, bp.hitCondition, bp.logMessage),
                    ]);
                }
            });

            debugSessionDisposes.push(
                vscode.debug.onDidChangeBreakpoints((event: vscode.BreakpointsChangeEvent) => {
                    event.added.map((bp: vscode.SourceBreakpoint) => {
                        if (bp.location.uri.fsPath === filePath) {
                            const location: vscode.Location = new vscode.Location(
                                vscode.Uri.file(newSourceFilePath),
                                bp.location.range,
                            );
                            vscode.debug.addBreakpoints([
                                new vscode.SourceBreakpoint(
                                    location,
                                    bp.enabled,
                                    bp.condition,
                                    bp.hitCondition,
                                    bp.logMessage,
                                ),
                            ]);
                        }
                    });

                    event.removed.map((bp: vscode.SourceBreakpoint) => {
                        if (bp.location.uri.fsPath === filePath) {
                            const location: vscode.Location = new vscode.Location(
                                vscode.Uri.file(newSourceFilePath),
                                bp.location.range,
                            );
                            vscode.debug.removeBreakpoints([new vscode.SourceBreakpoint(location)]);
                        }
                    });

                    event.changed.map((bp: vscode.SourceBreakpoint) => {
                        if (bp.location.uri.fsPath === filePath) {
                            const location: vscode.Location = new vscode.Location(
                                vscode.Uri.file(newSourceFilePath),
                                bp.location.range,
                            );
                            vscode.debug.removeBreakpoints([new vscode.SourceBreakpoint(location)]);
                            vscode.debug.addBreakpoints([
                                new vscode.SourceBreakpoint(
                                    location,
                                    bp.enabled,
                                    bp.condition,
                                    bp.hitCondition,
                                    bp.logMessage,
                                ),
                            ]);
                        }
                    });
                }),
            );

            debugSessionDisposes.push(
                vscode.debug.onDidTerminateDebugSession((event: vscode.DebugSession) => {
                    if (event.name === debugSessionName) {
                        debugSessionDisposes.map((d: vscode.Disposable) => d.dispose());
                    }
                }),
            );
        }

        return;
    }
}

export const cppExecutor: CppExecutor = new CppExecutor();
