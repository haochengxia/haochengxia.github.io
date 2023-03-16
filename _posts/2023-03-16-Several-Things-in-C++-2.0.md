---
layout: post
title:  "Several Things in C++ 2.0"
date:   2023-03-16 20:00:00 +0800
categories: jekyll update
---

> This blog written with _侯捷-C++标准11-14_.
>
> Updated at 2023/03/16

#### 1. Variadic Template

It is very convinent to realize recursive function call with _variadic template_.

```cpp
void printX() {}

template <typename T, typename... Types>
void printX(const T& firstArg, const Types& ...args) 
{
    std::cout << firstArg << std::endl;
    printX(args...);
}
```

#### 2. Spaces in Template Expressions

```cpp
std::vector<std::list<int> > // before C++ 11
std::vector<std::list<int>> // OK now
```

#### 3. nullptr and std::nullptr_t

`nullptr` is a new keyword. It has type `std::nullptr_t`.

```cpp
void f(int);
void f(void*);
f(nullptr); // call f(void*)

// in include\stddef.h
typedef decltype(nullptr) nullptr_t;
```

#### 4. Automatic Type Deduction with `auto`

Q: When we use `auto`?

A: Where the type is a pretty long and/or complicated experssion. Here is the typical scenarios.

- the type of container's iterator.
- the type of lambda object.

```cpp
std::vector<string> v;
auto pos = v.begin();

auto l = [] {
    std::cout << ("Hello") std::endl;
}
```

#### 5. Uniform Initialization

Unify the variable initialization method with `initializer_list<T>` - using braces to wrap parameters after a variable.

```cpp
int i{}; // i is initialized by 0
int* j{}; // j is initialized by nullptr

int x1{5.0}; // ERROR: narrowing; in GCC just warning
char c1{7}; // OK
char c2{99999}; // ERROR: narrowing (not fit for char)

std::vector<int> arr{1,2,3,4}; // OK
std::vector<int> arr(4){1,2,3,4}; // ERROR: expected ‘,’ or ‘;’ before ‘{’ token
```

#### 6. Initializer Lists

The initialization with `initializer_list<T>` is powered by `array` in standard template library. In an instance of `initializer_list<T>`, there is no data but ptr.

```cpp
// from https://github.com/microsoft/STL/blob/main/stl/inc/initializer_list
_STD_BEGIN
_EXPORT_STD template <class _Elem>
class initializer_list {
public:
    using value_type      = _Elem;
    using reference       = const _Elem&;
    using const_reference = const _Elem&;
    using size_type       = size_t;

    using iterator       = const _Elem*;
    using const_iterator = const _Elem*;

    constexpr initializer_list() noexcept : _First(nullptr), _Last(nullptr) {}

    constexpr initializer_list(const _Elem* _First_arg, const _Elem* _Last_arg) noexcept
        : _First(_First_arg), _Last(_Last_arg) {}

    _NODISCARD constexpr const _Elem* begin() const noexcept {
        return _First;
    }

    _NODISCARD constexpr const _Elem* end() const noexcept {
        return _Last;
    }

    _NODISCARD constexpr size_t size() const noexcept {
        return static_cast<size_t>(_Last - _First);
    }

private:
    const _Elem* _First;
    const _Elem* _Last;
};

_EXPORT_STD template <class _Elem>
_NODISCARD constexpr const _Elem* begin(initializer_list<_Elem> _Ilist) noexcept {
    return _Ilist.begin();
}

_EXPORT_STD template <class _Elem>
_NODISCARD constexpr const _Elem* end(initializer_list<_Elem> _Ilist) noexcept {
    return _Ilist.end();
}
_STD_END
```

Moreover, for a frequently used container `vector`, its assignment and insert can also pass in an instance of `initializer_list<T>`.

```cpp
vector<int> a {0,1,2,3};
a = {0,1,2,3,4,5};
a.insert(a.begin()+2, {0,1,2,3,4,5});

max({0,1,2,3,4,5}); // initializer_list can also be the parameter of max and min
min({0,1,2,3,4,5});
```

#### 7. Explicit `ctor`

Disallow implicit type casting.

```cpp
// explicit for ctors taking one argument (before C++ 11)
struct Complex {
    int real, imag;
    
    Complex(int re, int im=0): real(re), imag(im) {}
    
    explicit
    Complex operator+(const Complex x) { 
      return Complex((real + x.real),
                     (imag + x.imag));
    }
}

Complex c1(12, 5);
Complex c2 = c1 + 5; // ERROR, no explicit is OK

// explicit for ctors taking more than one argument (C++ 11)
class P {
public:
    P(int a, int b) {
        std::cout << "P(int a, int b) \n";
    }
    
    P(std::initializer_list<int>) {
        std::cout << "P(initializer_list<int>) \n";
    }

    explicit P(int a, int b, int c) {
        std::cout << "explicit P(int a, int b, int c) \n";
    }
}

P p{77, 5, 42};
P p = {77, 5}; // OK
P p = {77, 5, 42}; // ERROR: converting 'const p' from initializer list would use explicit ...
```

#### 8. Range-based `for` statement

```cpp
for (const auto& elem: coll) {
    std::cout << elem << std::endl;
}
```

#### 9. `=default` \& `=delete`

_Rule of Three_ (before C++ 11) and _Rule of Five_ (since C++ 11).

Q: What is "_Rule of Three_"?

A: According to Wiki, the rule of three (also known as the law of the big three or the big three) is a rule of thumb in C++ (prior to C++11) that claims that if a class defines any of the following then it should probably explicitly define all three:

- destructor
- copy constructor
- copy assignment operator

The rule of three claims that if one of these had to be defined by the programmer, it means that the compiler-generated version does not fit the needs of the class in one case and it will probably not fit in the other cases either. For C++ 11, there are two additional functions:

- move constructor
- move assignment operator

Q: When we need to write the functions in the Rule of Three?
A: When a class has pointer member then we need to write them by ourselves rather than use the default impl from the compiler.

##### No-copy and Private copy

```cpp
// Block the operation copy by =delete
struct NoCopy {
    NoCopy() = default; // use the synthesized default constructor
    NoCopy(const NoCopy&) = delete; // no copy
    NoCopy &operator=(const NoCopy&) = delete;// no assignment
    ~NoCopy() = default; // use the synthesized destructor other members;
}

// Let friends and members use operation copy
class PrivateCopy {
private:
    PrivateCopy(const PrivateCopy&);
    PrivateCopy &operator=(const PrivateCopy&);
public:
    PrivateCopy() = default; // use the synthesized default constructor
}
```

#### 10. Alias Template

```cpp
template <typename T>
using Vec = std::vector<T, MyAlloc<T>>; // using own allocator

Vec<int> coll; // equivalent to
std::vector<int, MyAlloc<int>> coll;
```

If we want to test a template with different value types, we can use the following methods.

1. function template + iterator + traits (before C++ 11)

    With the container template in standard template library, we can get the value type easily with the iterator.

    ```cpp
    template <typename Container>
    void test_moveable(Container c) {
        typedef typename iterator_traits<typename Container::iterator>::value_type Valtype; // get value type through iterator
        for (long i = 0; i < SIZE; ++i) {
            c.insert(c.end, Valtype());
        }
        ...
    }
    
    test_moveable(list<MyString>);
    test_moveable(list<MyStrNoMove>);

    test_moveable(vector<MyString>);
    test_moveable(vector<MyStrNoMove>); 
    ```

2. template template parameter (before C++ 11, since C++ 03)

    Note that there is template parameter of template.

    ```cpp
    template <typename T, 
    template <typename T, typename ALLOC = std::allocator<T>> class Container>
    class XC1s {
    private:
        Container<T> c;
    public:
        XC1s() {
            for (long i = 0; i < SIZE; ++i) {
                c.insert(c.end, T());
            }
            ...
        }
    }
    
    XCls<MyString, std::vector> c1;
    ```

3. template template parameter + alias template (since C++ 11)

    ```cpp
    template <typename T, 
    template <typename T> class Container>
    class XC1s {
    private:
        Container<T> c;
    public:
        XC1s() {
            for (long i = 0; i < SIZE; ++i) {
                c.insert(c.end, T());
            }
            ...
        }
    }
    
    template <typename T>
    using Vec = std::vector<T, allocator<T>>;
    XCls<MyString, Vec> c1;
    ```

#### 12. Type Alias, `noexcept`, `override`, `final`

Type alias is similar to `typedef`.

```cpp
using func = void(*)(int, int);
void example(int, int) {};
func fn = example; // OK
```

Clarification on the usage of `using`.

- using-directives for namespaces and using-declarations for namespace members;

  ```cpp
  using namespace std;
  using std::count;
  ```

- using-declerations for class members; (`using std::count;` inner class);

- type alias and alias template declaration (Since C++ 11).

##### nonexcept

`noexcept` indicates that a function will not throw any exception. And conditions can be attached.

```cpp
void swap (Tpe& x, Tpe& y) noexcept(noexcept(x.swap(y))) {
    x.swap(y);
}


// Then the move constructor will be called whenthe vector grows. 
// If the constructor is not noexcept, std::vector can't use it. 
// Growable conatiners includes vector and deque (possibly make memory reallocation).
class MyString { 
private:
    char* _data;
    size_t _len;
...
public:
    //move constructor
    MyString(MyString&& str) noexcept: _data(str._data), _len(str._len)  {...}

    //move assignment
    MyString& operator=(MyString&& str)noexcept {... return *this;}
}
```

##### `override`

Inform the complier that I override some virtual function in the parent class.

```cpp
virtual void vfunc(float) override {};
```

##### `final`

Inform the complier that this class will not have any derivated class anymore or this function will not be overrided anymore.

```cpp
virtual void vfunc(float) final {};
```

#### 13. decltype

It can be used to satisfy the demands to `typeof`. It has different application scenarios.

- declare return types;

    ```cpp
    template <typename T1, typename T2>
    auto add(T1 x, T2 y) -> decltype(x+y);
    ```

- in metaprogramming;

    ```cpp
    template <typename T>
    void test18_decltype(T obj) {
        std::map<std::string, float>::value_type elem1;
        std::map<std::string, float> coll;
        decltype(coll)::value_type elem2;
    }
    ```

- pass the type of a lambda.
  
    ```cpp
    auto cmp = [] (const Person& pl, const Person& p2) {
        return pl.lastname()<p2.lastname() || (pl.lastname() == p2.lastname() && pl.firstname()<p2.firstname());
    }
    std::set<Person, decltype(cmp)> coll(cmp);
    ```

#### 14. lambda

```cpp
[...] (...) mutable throwSpec -> retType {...}
  |     |      |        |           |      |
  |     |     opt      opt         opt   body
  |   parameters (if one of the following three occurs, () are mandatory)
lambda introducer
```

`[&]` to pass all by references
`[=, &y]` to pass `y` by reference and all other objects by value

Note that lambda do not have the default constructor function and assigment operator.
