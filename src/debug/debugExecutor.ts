import * as fse from "fs-extra";
import * as net from "net";
import * as path from "path";
import * as vscode from "vscode";
import { leetCodeChannel } from "../leetCodeChannel";
import { leetCodeExecutor } from "../leetCodeExecutor";
import { fileMeta, parseTestString, getEntryFile } from "../utils/problemUtils";
import { leetCodeSubmissionProvider } from "../webview/leetCodeSubmissionProvider";
import problemTypes from "./problemTypes";
import { executeCommand } from "../utils/cpUtils";
import { extensionState } from "../extensionState";

interface IDebugConfig {
    type: string;
    program?: string;
    env?: {
        [key: string]: any;
    };
    cwd?: string;
    sourceFileMap?: any;
}

const debugConfigMap: Map<string, IDebugConfig> = new Map([
    [
        "javascript",
        {
            type: "node",
        },
    ],
    [
        "cpp",
        {
            type: "cppdbg",
            MIMode: "gdb",
            setupCommands: [
                {
                    description: "Enable pretty-printing for gdb",
                    text: "-enable-pretty-printing",
                    ignoreFailures: true,
                },
            ],
            miDebuggerPath: "F:\\software\\mingw64\\bin\\gdb.exe",
        },
    ],
    [
        "python3",
        {
            type: "python",
            env: {
                PYTHONPATH: "",
            },
        },
    ],
]);

interface IProblemType {
    funName: string;
    paramTypes: string[];
    returnType: string;
    testCase: string;
    specialFunName?: {
        [x: string]: string;
    };
}

interface IDebugResult {
    type: "success" | "error";
    message: string;
    problemNum: number;
    language: string;
    filePath: string;
    testString: string;
}

class DebugExecutor {
    private server: net.Server;

    constructor() {
        this.start();
    }

    public async execute(filePath: string, testString: string, language: string): Promise<string | undefined> {
        if (this.server == null || this.server.address() == null) {
            vscode.window.showErrorMessage("Debug server error, maybe you can restart vscode.");
        }

        const debugConfig: undefined | IDebugConfig = debugConfigMap.get(language);
        if (debugConfig == null) {
            vscode.window.showErrorMessage("Notsupported language.");
            return;
        }

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

        const funName: string = this.getProblemFunName(language, problemType);

        if (language === "javascript") {
            // check whether module.exports is exist or not
            const moduleExportsReg: RegExp = new RegExp(`module.exports = ${problemType.funName};`);
            if (!moduleExportsReg.test(sourceFileContent)) {
                fse.writeFile(
                    filePath,
                    sourceFileContent +
                        `\n// @after-stub-for-debug-begin\nmodule.exports = ${funName};\n// @after-stub-for-debug-end`,
                );
            }
        } else if (language === "python3") {
            // check whether module.exports is exist or not
            const moduleExportsReg: RegExp = /# @before-stub-for-debug-begin/;
            if (!moduleExportsReg.test(sourceFileContent)) {
                await fse.writeFile(
                    filePath,
                    `# @before-stub-for-debug-begin\nfrom python3problem${meta.id} import *\nfrom typing import *\n# @before-stub-for-debug-end\n\n` +
                        sourceFileContent,
                );
            }
            debugConfig.env!.PYTHONPATH = debugConfig.program;
        } else if (language === "cpp") {
            const newSourceFileName = `source${language}problem${meta.id}.cpp`;
            const newSourceFilePath = path.join(extensionState.cachePath, newSourceFileName);

            // check whether module.exports is exist or not
            const moduleExportsReg: RegExp = /\/\/ @before-stub-for-debug-begin/;
            if (!moduleExportsReg.test(sourceFileContent)) {
                const newContent =
                    `// @before-stub-for-debug-begin\n#include <vector>\nusing namespace std;\n// @before-stub-for-debug-end\n\n` +
                    sourceFileContent;
                await fse.writeFile(filePath, newContent);

                //create source file for build because g++ does not support inlucde file with chinese name
                await fse.writeFile(newSourceFilePath, newContent);
            } else {
                await fse.writeFile(newSourceFilePath, sourceFileContent);
            }

            // insert include code and replace function namem
            const includeFileRegExp: RegExp = /\/\/ @@stub\-for\-include\-code@@/;
            const entryFile = debugConfig.program;
            const entryFileContent: string = (await fse.readFile(entryFile)).toString();
            const newEntryFileContent: string = entryFileContent.replace(
                includeFileRegExp,
                `#include "${newSourceFileName}"`,
            );
            await fse.writeFile(entryFile, newEntryFileContent);

            const exePath: string = path.join(extensionState.cachePath, `${language}problem${meta.id}.exe`);

            try {
                const includePath = path.dirname(exePath);
                await executeCommand("g++.exe -g", [`${debugConfig.program} -o ${exePath} -I ${includePath}`]);
            } catch (e) {
                vscode.window.showErrorMessage(e);
                return;
            }

            debugConfig.program = exePath;
            debugConfig.cwd = extensionState.cachePath;
            // map build source file to user source file
            debugConfig.sourceFileMap = {
                [newSourceFilePath]: filePath,
            };

            console.log(vscode.debug.breakpoints);
        }

        const args: string[] = [
            filePath,
            testString,
            problemType.funName,
            problemType.paramTypes.join(","),
            problemType.returnType,
            meta.id,
            this.server.address().port.toString(),
        ];
        const debuging = await vscode.debug.startDebugging(
            undefined,
            Object.assign({}, debugConfig, {
                request: "launch",
                name: "Launch Program",
                args,
            }),
        );

        if (debuging) {
            vscode.debug.onDidChangeBreakpoints(event => {
                console.log(event);
            });

            vscode.debug.onDidStartDebugSession(event => {
                console.log(event);
            });

            vscode.debug.onDidTerminateDebugSession(event => {
                console.log(event);
            });
        }

        return;
    }

    /**
     * for some problem have special function name
     * @param language
     * @param problemType
     */
    private getProblemFunName(language: string, problemType: IProblemType): string {
        if (problemType.specialFunName && problemType.specialFunName[language]) {
            return problemType.specialFunName[language];
        }
        return problemType.funName;
    }

    private async start(): Promise<any> {
        this.server = net.createServer((clientSock: net.Socket) => {
            clientSock.setEncoding("utf8");

            clientSock.on("data", async (data: Buffer) => {
                const result: IDebugResult = JSON.parse(data.toString());
                if (result.type === "error") {
                    vscode.window.showErrorMessage(result.message);
                } else {
                    const leetcodeResult: string = await leetCodeExecutor.testSolution(
                        result.filePath,
                        parseTestString(result.testString.replace(/\\"/g, '"')),
                    );
                    if (!leetcodeResult) {
                        return;
                    }
                    leetCodeSubmissionProvider.show(leetcodeResult);
                }
            });

            clientSock.on("error", (error: Error) => {
                leetCodeChannel.appendLine(error.toString());
            });
        });

        this.server.on("error", (error: Error) => {
            leetCodeChannel.appendLine(error.toString());
        });

        // listen on a random port
        this.server.listen({ port: 0, host: "127.0.0.1" });
    }
}

export const debugExecutor: DebugExecutor = new DebugExecutor();
