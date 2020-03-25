
#ifndef COMMON_DEFINE
#define COMMON_DEFINE

#include <vector>
#include <string>
#include <cstring>
using namespace std;

struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL)
    {
    }
};

int parseNumber(cJSON *node);
vector<int> parseNumberArray(cJSON *node);
vector<vector<int>> parseNumberArrayArray(cJSON *node);
string parseString(cJSON *node);
vector<string> parseStringArray(cJSON *node);
vector<vector<string>> parseStringArrayArray(cJSON *node);
char parseCharacter(cJSON *node);
vector<char> parseCharacterArray(cJSON *node);
vector<vector<char>> parseCharacterArrayArray(cJSON *node);
ListNode *parseListNode(const vector<int> &vec);
vector<ListNode *> parseListNodeArray(const vector<vector<int>> &vec);

class NestedInteger
{
private:
    vector<NestedInteger> list{};
    int value;

public:
    NestedInteger(cJSON *node);

    // Return true if this NestedInteger holds a single integer, rather than a nested list.
    bool isInteger() const;

    // Return the single integer that this NestedInteger holds, if it holds a single integer
    // The result is undefined if this NestedInteger holds a nested list
    int getInteger() const;

    // Return the nested list that this NestedInteger holds, if it holds a nested list
    // The result is undefined if this NestedInteger holds a single integer
    const vector<NestedInteger> &getList() const;
};

vector<NestedInteger> parseNestedIntegerArray(cJSON *node);

#endif
