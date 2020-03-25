#include <vector>
using namespace std;

#include "cJSON.h"

// @@stub-for-include-code@@

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

ListNode *parseListNode(const vector<int> &vec)
{
    ListNode *head = nullptr;
    ListNode *current = nullptr;
    for (int i = 0; i < vec.size(); i++)
    {
        if (i == 0)
        {
            head = new ListNode(vec[i]);
            current = head;
        }
        else
        {
            current->next = new ListNode(vec[i]);
            current = current->next;
        }
    }
    return head;
}

vector<ListNode *> parseListNodeArray(const vector<vector<int>> &vec)
{
    vector<ListNode *> res{};
    for (int i = 0; i < vec.size(); i++)
    {
        res.push_back(parseListNode(vec[i]));
    }
    return res;
}

vector<NestedInteger> parseNestedIntegerArray(cJSON *node)
{
    vector<NestedInteger> res{};

    for (int i = 0; i < cJSON_GetArraySize(node); i++)
    {
        cJSON *item = cJSON_GetArrayItem(node, i);
        res.push_back(NestedInteger(item));
    }
    return res;
}

NestedInteger::NestedInteger(cJSON *node)
{
    if (node->type != cJSON_Array)
    {
        this->value = parseNumber(node);
    }
    else
    {
        this->list = parseNestedIntegerArray(node);
    }
}

bool NestedInteger::isInteger() const
{
    return this->list.size() == 0;
}

int NestedInteger::getInteger() const
{
    if (this->isInteger())
    {
        return this->value;
    }
    return -1;
}

const vector<NestedInteger> &NestedInteger::getList() const
{
    return this->list;
}
