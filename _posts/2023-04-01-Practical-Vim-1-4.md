---
layout: post
title:  "Practical Vim (1-4)"
date:   2023-04-01 22:00:00 +0800
categories: jekyll update
---

> This blog written with Vim实用技巧（第2版）.
>
> Updated at 2023/04/01

## 1 The Vim Way

### 1.1 Command `.`

`.` can repeat executing the last modification.

For example,

```plaintext
x // delete the char in the position of cursor
. // the same as above


>G // indent the following content
j 
. // indent
```

Entering and Exiting the insert mode will also be recorded as a modification.

`.` is micro macro which records the pressed key.

### 1.2 No self-repeatation

When we want to add `;` to the end of each line, we can move to line tail and use insert mode. Then move and use `.`.

```plaintext
$ a;<Esc>
j$ .
j$ .
```

It can be optimized. (`A` = `$a`)

```plaintext
A;<Esc>
j .
j .
```

| Compund command |Long command |
| - | - |
| `C` | `c$` |
| `s` | `cl$` |
| `S` | `^C` |
| `I` | `^i` |
| `A` | `$a` |
| `o` | `A<CR>` |
| `O` | `ko` |

### 1.3 Retreat in order to advance

#### Repeat modification

```plaintext
s<Space>+<Space><Esc> // "+" => " + "
```

#### Repeat movement

Command `f{char}` indicates that let Vim find the next position where `{char}` appears.

Then, `;` will find the next position of the targeted char.

### 1.4 Execute, repeat, and rollback

| purpose | operation | repeat | rollback |
| - | - | - | - |
| make a modification | {edit} | `.` | `u` |
| find the next specific char in line | `f{char}`/`t{char}` | `;` | `,` |
| find the previous specific char in line | `F{char}`/`T{char}` | `;` | `,` |
| find the next matched item in document  | /pattern`<CR>` | `n` | `N` |
| find the previous matched item in document  | ?pattern`<CR>` | `n` | `N` |
| replae | :s/target/replacement | `&` | `u` |
| make a series of modification | `qx{changes}q` | `@x` | `u` |

### 1.5 Find and replace manually

Sometimes, we do not want to replace blindly. (:%s/content/copy/g)
Move cursor to a word and then press `*`.  (:set hls) Then press `n` to walk.

### 1.6 Learn `.` paradigm

The ideal pattern is use a key to move and another key to execute edit, that is, `.` paradigm.

## 2 Normal mode

### 2.1 Put down the pen when pause

We do not spend much time in editing code but most time in reading and thinking.

### 2.2 Cut the revocation unit into chunks

```plaintext
i{insert some text}<Esc> // a modification
```

Thus, normal mode can help us control the granularity of revocation.

In insert mode, if we move cursor with \<UP\>, \<DOWN\>, \<RIGHT\>, or \<LEFT\>, the modification status will be reset. (just like you press \<ESC\>, then use `h`, `j`, `k`, `l`, and then go back to insert mode)

### 2.3 Construct repeatable modification

The metric is efficiency, that is, less keys.

`daw` indicates deleting a word.

### 2.4 Use times for simple arithmetic operation

Refer to :h count.

`<C-a>` indicates adding a number and `<C-x>` indicates deleting a number.

```plaintext
yy // copy current line
p // create a new line and paste the content
10<C-a>  // 5 => 15
```

### 2.5 Prefer repeatation rather than times

When we want to change "Delete more than one word" to "Delete one word", there are three approaches.

- `d2w`
- `2dw`
- `dw.` => (it is more flexible when we want to rollback)

### 2.6 Operator plus motion

`d{motion}` => `dl`, `daw`, `dap`. (:h operator)

When a operator command is called twice continuously, then it will be applied into the current line.

| command | usage |
|-|-|
| `c` | change |
| `d` | delete |
| `y` | copy to register |
| `g~` | invert the case |
| `gu` | convert to small case |
| `gU` | convert to big case |
| `>` | add indent |
| `<` | reduce indent |
| `=` | auto indent |
| `!` | use an external program to filter rows involving in {motion} |

Create custom operator. (:h map-operator)
Create custom motion. (:h omap-info)

When we use `dw`, between `d` and `w` we enter the operator-pending mode. We can also press `<Esc>` to go back to normal mode when `d` is pressed.

## 3 Insert mode

### 3.1 Real-time correction

In insert mode:
`<C-h>`: delete one char before cursor
`<C-w>`: delete one word before cursor
`<C-u>`: delete to the head of the line

### 3.2 Back to normal mode

In insert mode:
`<Esc>`: back to normal mode
`<C-[>`: back to normal mode

However, when we are in insert model but want to execute a command in normal mode, switching mode can be inefficient.
So, vim offer a insert-normal mode so that we can execute a command in normal mode once and go back to insert mode.

`<C-o>`: go to insert-normal mode

### 3.3 Stay in insert mode and paste

Remap `CapsLock` to `Esc`.

`<C-r>{register}`, for instance, `<C-r>0`, indicates that input the content of register in insert mode.

`<C-r><C-p>{register}` can avoid unnecessary indent.

### 3.4 Calculate anywhere

In normal mode, use `A` to enter insert mode, then `<C-r>=6*35<CR>`. 210 will be inserted in to the content.

### 3.5 & 3.6 Insert unusual character

We can insert a character in vim with its character code by `<C-v>{code}`.

For instance, input 'A' with `<C-r>065`. Unicode will more then 3 decimal digits, so we can use 4 hexadecimal digits to input, for instance, `<C-v>u00bf`.

`ga` to show the character code of a character. Besides, if `<C-r>` is followed by a nondigit key, it will insert the character represented by this key, for instance, `<C-v><Tab>` will insert tab character.

| key operation | usage |
|-|-|
| `<C-v>{123}`| decimal character code |
| `<C-v>u{1234}` | hexadecimal character code |
| `<C-v>{nondigit}` | original character |
| `<C-k>{char1}{char2}` | insert the character represented by digraph (for instance, `<C-k>?I`, refer to :h digraphs-default) |

### 3.7 Replace mode

We can use `R` to enter replace mode (work as key `<Insert>`).

Use s`gR` to enter virtual replace mode which will regard the tab as a group of space according to its fact width in the screen. For instance, a tab's width equals to 8 spaces. Only when we enter 8 characters, this tab will be replaced, otherwise the characters will be added in front of the tab.

Once version, `R` => `r{char}` and `gR` => `gr{char}`.

## 4 Visual mode

### 4.1 Understand visual mode

There are 3 visual modes. They are used for operate char, line, and block, respectively. We can also use `.` to repeat execute the command in visual mode.

Different from normal mode where we choose the operator and then choose the range, in visual mode, we choose the range and then the operator.

In normal mode, `viw` highlights a word.

`<C-g>` can switch between visual mode and select mode. In select mode, input will replace the selected content.

### 4.2 Select highlight area

| command | usage |
|-|-|
| `v` | char-oriented visual mode |
| `V` | line-oriented visual mode |
| `<C-v>` | col-block-oriented visual mode |
| `gv` | redo the last selection |

#### Switch between different modes

| command | usage |
|-|-|
| `<Esc>` / `<C-[>` | switch to normal mode |
| `v` / `V` / `<C-v>` | switch to normal mode |
| `v` | switch to char-oriented visual mode |
| `V` | switch to line-oriented visual mode |
| `<C-v>` | switch to col-block-oriented visual mode |
| `o` | switch active end |

### 4.3 Repeat line-oriented visual command

For instance, we want to indent the same content twice, then we can use `Vj` and `>.`.

### 4.4 Use operator command as possible

`vit` can be used to select the content inside the tag. For instance, select `one` in `<a href="#">one</a>`.

We need to note that if we repeat char-oriented visual command, only the same number of characters will be operated.

```plaintext
<a href="#">one</a>
<a href="#">two</a>
<a href="#">three</a>

<a href="#">ONE</a>
<a href="#">TWO</a>
<a href="#">THRee</a>
```

### 4.5 Use col-block-oriented visual mode to edit table

`C-v`, `3j`, `x...` to delete the spaces in all lines.

`gv`, `r|` to add a vertical line.

`Vr-` to enter line-oriented visual mode and replace one line of data with a horizontal line.

### 4.6 Edit colum text

```plaintext
li.one   a{ background-image: url('/images/sprite.png'); }
li.two   a{ background-image: url('/images/sprite.png'); }
li.three a{ background-image: url('/images/sprite.png'); }

// <C-v>jje
// c
// components
// <Esc> // only afer <Esc>, components will appear in all lines

li.one   a{ background-image: url('/components/sprite.png'); }
li.two   a{ background-image: url('/components/sprite.png'); }
li.three a{ background-image: url('/components/sprite.png'); }
```

### 4.7 Add text after the highlight area where each line has the different length

```plaintext
var foo = 1
var bar = 'a'
var foobar = foo + bar

// <C-v>jj$
// A
// ;
// <Esc>

var foo = 1;
var bar = 'a';
var foobar = foo + bar;
```
