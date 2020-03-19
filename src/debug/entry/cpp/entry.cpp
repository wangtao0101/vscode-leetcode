#include <iostream>
#include <vector>
#include <string>

// @@stub-for-include-code@@

using namespace std;

// int parseNumber(cJSON *node)
// {
//     if (node->type != cJSON_Number)
//     {
//         throw "Parse parameter error, expect Number";
//     }
//     return node->valueint;
// }

// vector<int> parseNumberArray(cJSON *node)
// {
//     if (node->type != cJSON_Array)
//     {
//         throw "Parse parameter error, expect NumberArray";
//     }

//     vector<int> res{};

//     for (int i = 0; i < cJSON_GetArraySize(node); i++)
//     {
//         cJSON *item = cJSON_GetArrayItem(node, i);
//         res.push_back(parseNumber(item));
//     }
//     return res;
// }

// vector<vector<int>> parseNumberArrayArray(cJSON *node)
// {
//     if (node->type != cJSON_Array)
//     {
//         throw "Parse parameter error, expect NumberArrayArray";
//     }

//     vector<vector<int>> res{};

//     for (int i = 0; i < cJSON_GetArraySize(node); i++)
//     {
//         cJSON *item = cJSON_GetArrayItem(node, i);
//         res.push_back(parseNumberArray(item));
//     }
//     return res;
// }

// string parseString(cJSON *node)
// {
//     if (node->type != cJSON_String)
//     {
//         throw "Parse parameter error, expect Number";
//     }
//     return node->valuestring;
// }

// vector<string> parseStringArray(cJSON *node)
// {
//     if (node->type != cJSON_Array)
//     {
//         throw "Parse parameter error, expect StringArray";
//     }

//     vector<string> res{};

//     for (int i = 0; i < cJSON_GetArraySize(node); i++)
//     {
//         cJSON *item = cJSON_GetArrayItem(node, i);
//         res.push_back(parseString(item));
//     }
//     return res;
// }

// vector<vector<string>> parseStringArrayArray(cJSON *node)
// {
//     if (node->type != cJSON_Array)
//     {
//         throw "Parse parameter error, expect StringArray";
//     }

//     vector<vector<string>> res{};

//     for (int i = 0; i < cJSON_GetArraySize(node); i++)
//     {
//         cJSON *item = cJSON_GetArrayItem(node, i);
//         res.push_back(parseStringArray(item));
//     }
//     return res;
// }

// char parseCharacter(cJSON *node)
// {
//     string res = parseString(node);
//     return res[0];
// }

// vector<char> parseCharacterArray(cJSON *node)
// {
//     if (node->type != cJSON_Array)
//     {
//         throw "Parse parameter error, expect parseCharacterArray";
//     }

//     vector<char> res{};

//     for (int i = 0; i < cJSON_GetArraySize(node); i++)
//     {
//         cJSON *item = cJSON_GetArrayItem(node, i);
//         res.push_back(parseCharacter(item));
//     }
//     return res;
// }

// vector<vector<char>> parseCharacterArrayArray(cJSON *node)
// {
//     if (node->type != cJSON_Array)
//     {
//         throw "Parse parameter error, expect StringArray";
//     }

//     vector<vector<char>> res{};

//     for (int i = 0; i < cJSON_GetArraySize(node); i++)
//     {
//         cJSON *item = cJSON_GetArrayItem(node, i);
//         res.push_back(parseCharacterArray(item));
//     }
//     return res;
// }

int main()
{
    vector<string> msg{"Hello", "C++", "World", "from", "VS Code", "and the C++ extension!"};

    for (const string &word : msg)
    {
        cout << word << " ";
    }
    cout << endl;

    vector<int> nums{2, 7, 11, 15};

    cout << (new Solution())->twoSum(nums, 9)[0];
}
