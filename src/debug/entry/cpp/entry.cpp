#include <iostream>
#include <vector>
#include <string>

// @@stub-for-include-code@@

using namespace std;

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
