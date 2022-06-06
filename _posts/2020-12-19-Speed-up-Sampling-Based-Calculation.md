---
layout: post
title:  "Speed up Sampling Based Calculation"
date:   2020-12-19 01:00:00 +0800
categories: jekyll update
---

> Auther: Percy
>
> Updated at 2020/12/19

### Body

To my best knowledge, the most of the sampling based algorithm can be simply run in multi-process/parallel as we can divide the samples into parts.

This simple blog aims at reminding myself that we can benefit a lot with naive multiprocessing.

The next part is a crude example on the calculation of Shpaley value based on Monte Carlo in Python.

* single processing

```python
from tqdm import trange
import numpy as np


def eval_shap(x_train, y_train, x_test, y_test):    
    for t in trange(M):
		    ''' calculate Shapley value with Monte Carlo
		    ...
		    '''
    return np.asarray(sv) # type(sv) -> list
```

* multiprocessing

```python
from tqdm import trange
from multiprocessing import Pool
from functools import partial
import numpy as np

procs_num = 5


def sub_task(x_train, y_train, x_test, y_test, ID):
    for t in trange(M / procs_num):
		    ''' calculate Shapley value with Monte Carlo
		    ...
		    '''
    # print('task of proc' + str(ID) + ' completed!')
    return sv # type(sv) -> list


def eval_shap_multi_proc(x_train, y_train, x_test, y_test):
    proc_ids = [i for i in range(procs_num)]

    pool = Pool()
    func = partial(sub_task, x_train, y_train, x_test, y_test)
    ret = pool.map(func, proc_ids)
    pool.close()
    pool.join()
    ret_arr = np.asarray(ret)
    return np.sum(ret_arr, axis=0)
```

### Time Cost Comparison

> Test on MacBook Pro (16-inch, 2019) 
>
> Intel Core i7 - 6 cores 2.6GHz
>
> 16 GB 2667MHz DDR4

```
# multi
100%|██████████| 6000/6000 [01:23<00:00, 71.56it/s]
100%|██████████| 6000/6000 [01:24<00:00, 70.99it/s]
100%|██████████| 6000/6000 [01:26<00:00, 69.50it/s]
100%|██████████| 6000/6000 [01:26<00:00, 69.49it/s]
100%|██████████| 6000/6000 [01:26<00:00, 69.28it/s]

# single
100%|██████████| 30000/30000 [06:31<00:00, 76.65it/s]
```

With multiprocessing, the time cost becomes a quarter of the original.

And the result is certainly similar. (They use different permutations here!)

```
# multi
[1172.625       843.54166667 1308.43333333 1159.20833333 1560.875
 1327.68333333  991.15        762.61666667 1379.56666667  520.84166667
  994.625       906.79166667 1050.1         805.875       987.28333333
 1025.06666667  923.14166667 1115.40833333  995.43333333  760.525
  916.14166667  687.3         892.63333333  912.675      1051.75833333
 1041.11666667 1010.83333333  718.66666667  799.10833333  960.50833333]
 
# single
[1155.29166667  863.43333333 1308.04166667 1189.74166667 1561.99166667
 1379.025       970.75        798.75       1313.13333333  522.35833333
  985.5         868.38333333 1056.575       757.6        1018.25833333
 1027.33333333  936.275      1033.80833333  991.68333333  789.7
  886.95        729.475       889.26666667  908.63333333 1066.10833333
 1056.36666667 1049.075       700.33333333  822.53333333  945.99166667]
```



## Chinese Version

### 正文

在我的认知中，大多数基于采样的算法都可以被很简单地多进程处理/并行化，因为采到的样本可以被分成多个部分。

这篇简单的博文用于提醒我自己，很简单的多进程/并行也可以有不错的收益。

接下来是一个简陋的Python例子，使用蒙特卡洛方法计算Shapley值。

* 单线程

见上文。

* 多线程

见上文。



### 耗时对比

见上文。
