---
layout: post
title:  "Practical Vim (5)"
date:   2023-04-05 22:00:00 +0800
categories: jekyll update
---

> This blog written with Vim实用技巧（第2版）.
>
> Created at 2023/04/05  
>
> Updated at 2023/04/10

## 5 Command Line Mode

### 5.1 Learn about command line mode

When press `:`, Vim will be switched into the command line mode, which is simliar to the command line in shell. We can enter a command and then execute it with `<CR>`. At any time, we can switch back into the normal mode with `<Esc>`.

The command executed in the command line mode is also be called Ex command for the history. When we press `\` for finding or `<C-r>=` to access the rigister, command line mode will be activated as well.

Here is some Ex commands, such as, :edit, :write, :tabnew, :prev, :next, :bprev, :bnext. (:h ex-cmd-index)

There is a table of the frequently used Ex command to operate the buffer.

| Command | Usage |
| - | - |
| :[range]delete [x] | delete the lines in the range [to reg X] |
| :[range]yank [x] | delete the lines in the range [to reg X] |
| :[line]put [x] | paste the content in reg X after the specific line |
| :[range]copy [address] | copy the lines in the range behind the address |
| :[range]move [address] | move the lines in the range behind the address|
| :[range]join | join the line in the range |
| :[range]normal [commands] | execute the normal mode command over each line in the range |
| :[range]substitute/{pattern}/{string}/[flags] | substitute {pattern} with {string} in the range |
| :[range]global/{pattern}/[cmd] | for each pos matched with {pattern} execute Ex command {cmd} |

### 5.2 Execute command ove one or multi-continuous lines

The abbreviation of `:print` is `:p`. We can use address to specify a range, for instance, `2,5p` which indicates that print line 2 to line 5.

```plaintext
:{start},{end}
```

`.` can be used to represent the address of the current line, for instance, `.,$` indicates from the current line to the bottom. `%` can be used to represent the whole file, for instance, `%p` indicates print the whole file.

#### Use the highlight area to specify the range

`'<` denotes the first line of the highlight area and `'>` indicates the last line of the highlight area. (`2G` in normal mode indicates that cursor goes to line 2)

#### Use mode to specify the range

Vim can also accept pattern as the address/range of a Ex command, for instance, `/<html>/,/<\/html>/p`.

#### Use offset to modify the range

```plaintext
:{address}+n // for instance, /<html>/+1,/<\/html>/-1p
```

#### Conclusion

| Symbol | Address |
| - | - |
| 1 | line 1 |
| $ | the last line |
| 0 | virtual line, above line 1 |
| . | current line |
| 'm | the line include postion mark m |
| '< | the first line of highlight area |
| '> | the last line of highlight area |
| % | all lines |

### 5.3 Use `:t` and `:m` command to copy and move lines

- `:t` or `:co` is the abbreviation of `:copy`;
- `:m` is the abbreviation of `:move`.

#### Use `:t` to copy lines

```plaintext
:6copy. // copy line 6 below the current line
```

Here is some applications.

 | Command | Usage |
 | - | - |
 | `:6.` | copy line 6 behind the current line |
 | `:t6` | copy the current line behind line 6 |
 | `:t.` | similar to `yyp` in the normal mode (but `yyp` will wirte reg) |
 | :t$ | copy the current line to the tail of the file |
 | :'<,'>t0 | copy the highlight area to the head of the file |

#### Use `:m` to move lines

```plaintext
:[range]move {address}

:'<'>m$ // the same as dGp when we select a highlight area and want to move it into the tail of the file
```

Repeating Ex command is simple by `@:`.

### 5.4 Execute normal mode command over the specific range

```plaintext
A;<Esc> // add ; in the tail of the current line

jVG // highlight the next lines
:'<'>normal . // each line add ;
```

Note that before do the normal mode command over the each line, the cursor will be move to the beginning of each line. Thus, `%normal i//` can comment the whole file.

### 5.5 Repeat the last Ex command

Use `@:`. And if we want to dicard, we can use `<C-o>` command  (appicable for some Ex commands).

### 5.6 Autofill Ex command

Use `<Tab>`. Reverse autofill use `<S-Tab>`.

`<C-d>` to show the available command list

### 5.7 Insert the current word into command line

`<C-r><C-w>` `<C-r><C-a>`

### 5.8 Backtrace history command

```plaintext
set history=200 // default is 20
```

In normal mode, input `q:` to enter the command line window,  `:q` to exit.

| Command | Action |
| - | - |
| `q/`| open search command history cmd window |
| `q:` | open Ex command history cmd window |
| `<C-f>` | switch from cmd line mode into cmd window |

### 5.9 Run shell command

Scope: in terminal Vim

#### Run the program in Shell

`:!ls` to list the current dict content.

In cmd line mode for shell command, `%` is the name of the current file. (`:!ruby %`)

If we want to run more than one command, we can use `:shell` to start a interactive session. (use `exit` to exit)

```plaintext
// an alternative approach
<C-z> // hanging vim
fg // Call back to the foreground
```

#### Use the buffer as std in or out

```plaintext
:read !{cmd} // read the output of the command
:write !{cmd} // use the buffer as the std in of the command

write !sh
write ! sh
write! sh // force write a file sh
```

#### Use external command to filter buffer

```plaintext
:2,$!sort -t',' -k2
```

A quick approach to switch into cmd line mode, `!{motion}`, for instance, `!G`.

#### Conclusion for shell command

| Command | Usage |
| - | - |
| :shell | open a shell (exit to go back) |
| :!{cmd} | run {cmd} in shell |
| :read !{cmd} | insert {cmd} output below the cursor |
| :[range]write !{cmd} | [range] as {cmd} input |
| :[range]!{filter} | Use external program {filter} filter specific [range] |

#### Batch your Ex command

```plaintext
:source batch.vim

// multifile
:argdo source batch.vim
```
