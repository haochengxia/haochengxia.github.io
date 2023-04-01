---
layout: post
title:  "Several Things in C++ 2.0 (cont.)"
date:   2023-03-19 18:00:00 +0800
categories: jekyll update
---

> This blog written with _侯捷-C++标准11-14_.
>
> Updated at 2023/03/19

#### 1. Revisit Variadic Template

It is very convinent to realize recursive function call with _variadic template_.

##### Example 1

```cpp
void printX() {}

template <typename T, typename... Types>
void printX(const T& firstArg, const Types& ...args) // more special
{
    std::cout << firstArg << std::endl;
    printX(args...);
}

template <typename... Types>
void printX(const Types& ...args) 
{
    ...
}
```

##### Example 2

Use variadic template to rewrite `printf()`.

```cpp
void printf(const char* s) {
    while (*s) {
        if (*s == '%' && *(++s) != '%') 
            throw std::runtime_error("invalid format string: missing argument");
        std::cout << *(s++);
    }
}

template <typename T, typename... Types>
void printf(const char* s, T value, Types... args) {
    while (*s) {
        if (*s == '%' && *(++s) != '%') {
            std::cout << value; 
            printf(++s, args...);
            return;
        }
        std::cout << *(s++);
    }
    throw std::logic_error("extra arguments provided to printf ");
}
```

##### Example 4

Use variadic template to realize `max` which can solve elements with arbitrary length.

```cpp
int maximum(int n)  {return n;}

template <typename... Types>
int maximum(int n, Types ...args) {
    return std::max(n, maximum(args...));
}
```

##### Example 5

Use variadic template to print the content in a tuple instance. `sizeof...()` can be used to get the number of elements and `get<IDX>()` can be used to get the IDX-th element.

```cpp
template <typename... Args>
ostream& operator<< (ostream& os, const tuple<Args...> & t) {
    os << "[";
    PRINT_TUPLE<0, sizeof...(Args), Args...>::print(os, t);
    return os << "]"; 
}

template <int IDX, int MAX, typename... Args>
struct PRINT_TUPLE {
    static void print(ostream& os, const tuple<Args...>& t) {
        os << get<IDX>(t) << (IDX+1 == MAX?) "": ",";
        PRINT_TUPLE<IDX+1, sizeof...(Args), Args...>::print(os, t);
    }
}

// terminate
template <int MAX, int MAX, typename... Args>
struct PRINT_TUPLE {
    static void print(ostream& os, const tuple<Args...>& t) {}
}
```

##### Example 6

Use variadic template to impl container `tuple`.

```cpp
template<typename... Values> class tuple;
template<> class tuple<> {};

template<typename Head, typename... Tail> 
class tuple<Head, Tail...> : private tuple<Tail...> {
    typedef tuple<Tail...> inherited;
public:
    tuple() {}
    tuple(Head v, Tail... vtail) : m_head(v), inherited(vtail...){
    }
    
    Head head() {return m_head;}
    inherited& tail() {return *this;}
protected:
    Head m_head;
}
```

##### Example 7

Composited tuple.

```cpp
template<typename... Values> class tuple;
template<> class tuple<> {};

template<typename Head, typename... Tail> 
class tuple<Head, Tail...> {
    typedef tuple<Tail...> composited;
protected:
    Head m_head;
    composited m_tail;
public:
    tuple() {}
    tuple(Head v, Tail... vtail) : m_head(v), m_tail(vtail...){
    }
    
    Head head() {return m_head;}
    composited& tail() {return m_tail;}

}
```

#### 23 Rvalue and Move Semantic

##### Rvalue references

Rvalue reference is a new reference type introduced in C++0x that helps solve the problem of _unnecessary copying_ and enable _perfect forwording_.

When the right-hand side of an assignment is an rvalue, then the left-hand side object can steal resources from the right-hand side object rather than performing a separate allocation, thus enabing _move semantics_.

Q: How to distinguish Rvalue and Lvalue?
A: Lvalue can appear on the left side of the operator= and Rvalue can only appear on the right hand of the operator=. (Just in logic, some compliers will not follow this design)

So, breifly we can call temp object as Rvalue and the return by function is also the Rvalue.

Note that before C++11, there is no Rvalue references. The move semantic can be regarded as the shallow copy and after move the original object cannot be used anymore.

```cpp
class MyString {
private:
    char* _data;
    ...
public:
    MyString(const MyString& str) : init list {
        ...
    }

    // move aware
    // move ctor
    MyString(MyString&& str) noexcept : init list {
        ...
    }
}

template<typename M>
void test_moveable(M c, long& value) {
    char buf[10];
    typedef typename iterator_traits<typename M::iterator>::value_type Vtype;
    clock_t timeStart = clock();
    for (long i = 0; i < vlaue; ++i) {
        sprintf(buf, 10, "%d", rand);
        auto ite = e.end()
        c.insert(ite, Vtype(buf));
    }
    cout << "ms:" << (clock() - timeStart) << endl;
}

M c1(c);
M c2(move(c1));
c1.swap(c2);
```

When we want to realize perfect forward which means that a function can pass both Lvalue and Rvalue, we can write as follows.

```cpp
template <typename T1, typename T2>
void functionA(T1&& t1, T2&& t2) {
    functionB(std::forward<T1>(t1), std::forward<T2>(t2));
}
```

##### Example: move aware class

```cpp
class MyString {
public:
    static size_t DCtor;
    static size_t Ctor;
    static size_t CCtor;
    static size_t CAsgn;
    static size_t MCtor;
    static size_t MAsgn;
    static size_t Dtor;
private:
    char* _data;
    size_t _len;
    void init_data(const char* s) {
        _data = new char[_len+1];    
        memcpy(_data, s, _len);
        _data[_len] = '\0';
    }
public:
    // default constructor
    MyString : _data(nullptr), _len(0) {++DCtor};

    MyString(const char* p) : _len(strlen(p)) {
        ++Ctor;
        _init_data(p);
    }
    
    // copy constructor
    MyString(cosnt MyString& str) : _len(str._len) {
        ++CCtor;
        _init_data(str._data);
    }

    // move ctor
    MyString(MyString&& str) noexcept : _data(str._data), _len(str._len) {
        ++MCtor;
        str._len = 0;
        str._data = nullptr;
    }

    // copy assign
    MyString& operator=(const MyString& str) {
        ++CAsgn;
        if (this != &str) {
            len = str._len;
            _init_data(str._data);
        } else {}
        return *this;
    }

    // move assign
    MyString& operator=(MyString& str) noexcept {
        ++MAsgn;
        if (this != &str) {
            if (_data) delete _data;
            _len = str._len;
            _data = str._data;
            str._len = 0;
            str._data = NULL;
        }
        return *this;
    }

    // dtor
    virtual ~MyString() {
        ++ Dtor;
        if (_data) delete _data;
    }
...
}

template<typename M>
void test_moveable(M c, long& value) {
    char buf[10];
    typedef typename iterator_traits<typename M::iterator>::value_type Vtype;
    clock_t timeStart = clock();
    for (long i = 0; i < vlaue; ++i) {
        sprintf(buf, 10, "%d", rand);
        auto ite = e.end()
        c.insert(ite, Vtype(buf));
    }
    cout << "ms:" << (clock() - timeStart) << endl;
}

M c1(c);
M c2(move(c1));
c1.swap(c2);
```

#### 30 Hash Function

Before learn hash function, we need to know something about hashtable which is based on the separate chaining.

In hashtable, if the number of elements is larger than the number of buckets, then rehashing and resize the table into 2x original size (primer).

##### Example: a universal hash function

```cpp
template <typename T>
inline void hash_combine(size_t& seed, const T& val) {
    seed ^= hash<T>()(val) + 0x9e3779b9 + (seed<<6) + (seed>>2);
}

template <typename>
inline void hash_val(size_t& seed, const T& val, cont Types&... args) {
    hash_combine(seed, val);
    hash_val(seed, args);
}

template <typename... Types>
inline size_t hash_val(const Types&... args) {
    size_t seed = 0;
    hash_val(seed, args...);
    return seed;
}

class CustomerHash {
public:
    size_t operator()(const Customer& c) const {
        return hash_val(c.fname, c.lname, c.no);
    }
}
```
