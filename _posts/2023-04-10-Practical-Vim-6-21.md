---
layout: post
title:  "Practical Vim (6-21)"
date:   2023-04-10 22:00:00 +0800
categories: jekyll update
---

> This blog written with Vim实用技巧（第2版）.
>
> Created at 2023/04/10  

Skim the rest.

- The file is read into a buffer with the same name when we open a file in Vim;
- switch between different buffers, `:bnext` `:bprev` or `<C-^>`;
- for a hidden buffer, we can use `:wirte` to save change or `:edit!` to dicard change;
- split windows:

    | Command | Usage |
    | - | - |
    | `<C-w>s` | horizontal spliting |
    | `<C-w>v` | vertical spliting |
    | `:split {file}` | ~ |
    | `vsplit {file}` | ~ |
    | `<C-w>{w|h|j|k|l}` | move |
    | `<C-w>c` or `:clo[se]` | close current |
    | `<C-w>o` or `:on[ly]` | only preserve the current |



