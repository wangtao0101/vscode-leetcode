#include <iostream>
#include <vector>
#include <string>
#include <cstring>

#include "cJSON.c"

// @@stub-for-include-code@@

using namespace std;

int parseNumber(cJSON *node)
{
    if (node->type != cJSON_Number)
    {
        throw "Parse parameter error, expect Number";
    }
    return node->valueint;
}

vector<int> parseNumberArray(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        throw "Parse parameter error, expect NumberArray";
    }

    vector<int> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(parseNumber(item));
    }
    return res;
}

vector<vector<int>> parseNumberArrayArray(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        throw "Parse parameter error, expect NumberArrayArray";
    }

    vector<vector<int>> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(parseNumberArray(item));
    }
    return res;
}

string parseString(cJSON *node)
{
    if (node->type != cJSON_String)
    {
        throw "Parse parameter error, expect Number";
    }
    return node->valuestring;
}

vector<string> parseStringArray(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        throw "Parse parameter error, expect StringArray";
    }

    vector<string> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(parseString(item));
    }
    return res;
}

vector<vector<string>> parseStringArrayArray(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        throw "Parse parameter error, expect StringArray";
    }

    vector<vector<string>> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(parseStringArray(item));
    }
    return res;
}

char parseCharacter(cJSON *node)
{
    string res = parseString(node);
    return res[0];
}

vector<char> parseCharacterArray(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        throw "Parse parameter error, expect parseCharacterArray";
    }

    vector<char> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(parseCharacter(item));
    }
    return res;
}

vector<vector<char>> parseCharacterArrayArray(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        throw "Parse parameter error, expect StringArray";
    }

    vector<vector<char>> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(parseCharacterArray(item));
    }
    return res;
}

vector<string> split(const string &str, const string &delim)
{
    vector<string> res;
    if ("" == str)
        return res;

    char *strs = new char[str.length() + 1];
    strcpy(strs, str.c_str());

    char *d = new char[delim.length() + 1];
    strcpy(d, delim.c_str());

    char *p = strtok(strs, d);
    while (p)
    {
        string s = p;
        res.push_back(s);
        p = strtok(NULL, d);
    }

    return res;
}

int main(int argc, char **argv)
{
    for (int i = 0; i < argc; i++)
    {
        cout << "Argument " << i << " is " << argv[i] << endl;
    }

    vector<string> paramsType = split(argv[4], ",");
    vector<string> params = split(argv[2], "\\n");
    vector<void *> res{};

    for (int i = 0; i < params.size(); i++)
    {
        string param = params[i];
        string paramType = paramsType[i];
        cJSON *item = cJSON_Parse(param.c_str());
        if (paramType == "number")
        {
            int num = parseNumber(item);
            res.push_back(&num);
        }
        else if (paramType == "number[]")
        {
            vector<int> vint = parseNumberArray(item);
            res.push_back(&vint);
        }
    }

    vector<int> nums{2, 7, 11, 15};

    vector<int> *z = static_cast<vector<int> *>(res[0]);
    cout << (new Solution())->twoSum(*z, 9)[0];
}
