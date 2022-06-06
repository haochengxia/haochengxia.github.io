---

layout: post

title: "Begin with QEMU educational PCI device "

date:  2020-09-05 20:00:00 +0800

categories: jekyll update

---



> Author: Percy
>
> Updated at 2020/09/07



## 0 Introduction of PCI structure

> This part mainly quoted from wiki [Link](https://zh.wikipedia.org/wiki/%E5%A4%96%E8%AE%BE%E7%BB%84%E4%BB%B6%E4%BA%92%E8%BF%9E%E6%A0%87%E5%87%86)

PCI represents Peripheral Component Interconnect.

### 0.1 Main Concepts

* PCI device: A device that conforms to the PCI bus standard is called a PCI device, and the PCI bus architecture can contain multiple PCI devices.
* PCI bus: There can be multiple in the system, similar to a tree structure for expansion. Each PCI bus can connect multiple PCI devices. The upper and lower PCI bus interconnections are realized through the bridge.
* PCI bridge: Connect the link between the PCI bus.

```
------------------------------------------------------------------ Host bus
	|
	| HOST/PCI bridge
	|				| PCI device1    | PCI device2
------------------------------------------------------------------ PCI BUS1
		|
		| PCI/PCI bridge
		|					| PCI device3
------------------------------------------------------------------ PCI BUS2

```

* Other: 

  * PCI is a **parallel bus**. In one clock cycle, 32 bits (later expanded to 64) are simultaneously transmitted. Address and data are respectively transmitted once in a clock cycle according to the protocol. 

  * The PCI address space is **isolated** from the processor address space. The processor bus and PCI bus work at their respective clock frequencies and do not interfere with each other. (with the buffers in host bridge)

    > The "Host Bridge" is what connects the tree of PCI busses (which are internally connected with PCI-to-PCI Bridges) to the rest of the system.  Usually the processor(s) and memory are on the "other" side of the Host Bridge.
    



### 0.2 PCI device intro

Every PCI device has a configuration space and several address space. 

#### 0.2.1 PCI configuration space

In order to implements hot-plugin, configuration space whose size is 256 bytes totally is neccessary.

**Access method**

Write IO ports CFCh and CF8h. Only the first 256 bytes of PCI/PCIe devices can be accessed. As mentioned above, the whole configuration space size of PCI device is 256 bytes.

There are two types configuration space, agent and bridge.

**Agent configuration space**

```
	DW |    Byte3    |    Byte2    |    Byte1    |     Byte0     | Addr
		---+---------------------------------------------------------+-----
		 0 | 　　　　Device ID 　　　　| 　　　　Vendor ID 　　　　　|　00
		---+---------------------------------------------------------+-----
		 1 | 　　　　　Status　　　　　| 　　　　 Command　　　　　　|　04
		---+---------------------------------------------------------+-----
		 2 | 　　　　　　　Class Code　　　　　　　　|　Revision ID　|　08
		---+---------------------------------------------------------+-----
		 3 | 　　BIST　　| Header Type | Latency Timer | Cache Line  |　0C
		---+---------------------------------------------------------+-----
		 4 | 　　　　　　　　　　Base Address 0　　　　　　　　　　　|　10
		---+---------------------------------------------------------+-----
		 5 | 　　　　　　　　　　Base Address 1　　　　　　　　　　　|　14
		---+---------------------------------------------------------+-----
		 6 | 　　　　　　　　　　Base Address 2　　　　　　　　　　　|　18
		---+---------------------------------------------------------+-----
		 7 | 　　　　　　　　　　Base Address 3　　　　　　　　　　　|　1C
		---+---------------------------------------------------------+-----
		 8 | 　　　　　　　　　　Base Address 4　　　　　　　　　　　|　20
		---+---------------------------------------------------------+-----
		 9 | 　　　　　　　　　　Base Address 5　　　　　　　　　　　|　24
		---+---------------------------------------------------------+-----
		10 | 　　　　　　　　　CardBus CIS pointer　　　　　　　　　 |　28
		---+---------------------------------------------------------+-----
		11 |　　Subsystem Device ID　　| 　　Subsystem Vendor ID　　 |　2C
		---+---------------------------------------------------------+-----
		12 | 　　　　　　　Expansion ROM Base Address　　　　　　　　|　30
		---+---------------------------------------------------------+-----
		13 | 　　　　　　　Reserved(Capability List)　　　　　　　　 |　34
		---+---------------------------------------------------------+-----
		14 | 　　　　　　　　　　　Reserved　　　　　　　　　　　　　|　38
		---+---------------------------------------------------------+-----
		15 | 　Max_Lat　 | 　Min_Gnt　 | 　IRQ Pin　 | 　IRQ Line　　|　3C
		-------------------------------------------------------------------
```

Registers Meanings:

* Device ID & Vendor ID: The manufacturer of a device and the specific device are marked. For example, the Vendor ID of Intel's device is usually 0x8086, and the Device ID is determined by the manufacturer.

* Class code: There are three bytes in total, which are class code, subclass code, and programming interface. The class code is not only used to distinguish the device type, but also the specification of the programming interface 

* IRQ Line: The PC used to manage 16 hardware interrupts by two 8259 chips. Now in order to support symmetric multi-processors, there is APIC (Advanced Programmable Interrupt Controller), which supports the management of 24 interrupts.

* IRQ Pin: PCI has 4 interrupt pins. This register indicates which pin the device is connected to.

Use `lspci` command to see the info of pci devices.

```bash
parallels@parallels-Parallels-Virtual-Platform:~$ lspci -mk
00:00.0 "Host bridge" "Intel Corporation" "82P965/G965 Memory Controller Hub" -r02 "Parallels, Inc." "82P965/G965 Memory Controller Hub"
00:01.0 "PCI bridge" "Intel Corporation" "82G35 Express PCI Express Root Port" -r02 -p01 "" ""


parallels@parallels-Parallels-Virtual-Platform:~$ lspci -vv
00:00.0 Host bridge: Intel Corporation 82P965/G965 Memory Controller Hub (rev 02)
	Subsystem: Parallels, Inc. 82P965/G965 Memory Controller Hub
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR+ FastB2B- DisINTx-
	Status: Cap+ 66MHz- UDF- FastB2B+ ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0

00:01.0 PCI bridge: Intel Corporation 82G35 Express PCI Express Root Port (rev 02) (prog-if 01 [Subtractive decode])
	Control: I/O+ Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR+ FastB2B- DisINTx-
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0
	Bus: primary=00, secondary=01, subordinate=01, sec-latency=0
	I/O behind bridge: 00006000-00007fff
	Memory behind bridge: e2000000-edffffff
	Prefetchable memory behind bridge: 00000000b0000000-00000000dfffffff
	Secondary status: 66MHz- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- <SERR- <PERR-
	BridgeCtl: Parity+ SERR+ NoISA- VGA+ MAbort- >Reset- FastB2B-
		PriDiscTmr- SecDiscTmr- DiscTmrStat- DiscTmrSERREn-
	Capabilities: <access denied>
```



## 1 Create PCI device

Look into the file [/hw/misc/edu.c](https://github.com/qemu/qemu/blob/master/hw/misc/edu.c).

```c
static void pci_edu_register_types(void)
{
    static InterfaceInfo interfaces[] = {
        { INTERFACE_CONVENTIONAL_PCI_DEVICE },
        { },
    };
    static const TypeInfo edu_info = {
        .name          = TYPE_PCI_EDU_DEVICE,
        .parent        = TYPE_PCI_DEVICE,
        .instance_size = sizeof(EduState),
        .instance_init = edu_instance_init,
        .class_init    = edu_class_init,	// pci device init func
        .interfaces = interfaces,
    };

    type_register_static(&edu_info); // register device structure
}
type_init(pci_edu_register_types)
```

In func `edu_class_init`, the content of configuration space is written. What's more, the member of  PCIDeviceClass `realize` is set as well.

```c
static void edu_class_init(ObjectClass *class, void *data)
{
    DeviceClass *dc = DEVICE_CLASS(class);
    PCIDeviceClass *k = PCI_DEVICE_CLASS(class);

    k->realize = pci_edu_realize;
    k->exit = pci_edu_uninit;
    k->vendor_id = PCI_VENDOR_ID_QEMU;
    k->device_id = 0x11e8;
    k->revision = 0x10;
    k->class_id = PCI_CLASS_OTHERS;
    set_bit(DEVICE_CATEGORY_MISC, dc->categories);
}
```

Member `realize` is a function pointer.

```c
void (*realize)(PCIDevice *dev, Error **errp);
```

The function pointed to is  `pci_edu_realize`.

```c
static void pci_edu_realize(PCIDevice *pdev, Error **errp)
{
    EduState *edu = EDU(pdev);
    uint8_t *pci_conf = pdev->config;

    pci_config_set_interrupt_pin(pci_conf, 1);

    if (msi_init(pdev, 0, 1, true, false, errp)) {
        return;
    }

    timer_init_ms(&edu->dma_timer, QEMU_CLOCK_VIRTUAL, edu_dma_timer, edu);

    qemu_mutex_init(&edu->thr_mutex);
    qemu_cond_init(&edu->thr_cond);
    qemu_thread_create(&edu->thread, "edu", edu_fact_thread,
                       edu, QEMU_THREAD_JOINABLE);

    memory_region_init_io(&edu->mmio, OBJECT(edu), &edu_mmio_ops, edu,
                    "edu-mmio", 1 * MiB);	// register MemoryRegion struct, alloc
    pci_register_bar(pdev, 0, PCI_BASE_ADDRESS_SPACE_MEMORY, &edu->mmio);	// register a bar whose type is mmio
}
```



## 2 Data Communication

After the emulation of device info and memory region, the most significant part needs to be resolve. The establishment of communication channel between the PCI driver of linux kernel and the PCI device emulated by QEMU.

### 2.1 Read and Write

Let's focus on the function `edu_mmio_read` and `edu_mmio_write` who have defined the I/O operations.

What is the real ability of this device?

> A driver with I/Os, IRQs, DMAs and such.
>
> The devices behaves very similar to the PCI bridge present in the COMBO6 cards developed under the Liberouter wings. 

According to the addr which is the offset, the operator can set or get the different properties. With these various behavoirs.

> edu_mmio_read

| addr | size (Byte) | info                       |
| ---- | ----------- | -------------------------- |
| 0x00 | 4           | const                      |
| 0x04 | 4           | EduState / addr4           |
| 0x08 | 4           | EduState / fact            |
| 0x20 | 4           | EduState / status          |
| 0x24 | 4           | EduState / irq_status      |
| 0x80 | 8           | EduState / dma_state / src |
| 0x88 | 8           | EduState / dma_state / dst |
| 0x90 | 8           | EduState / dma_state / cnt |
| 0x98 | 8           | EduState / dma_state / cmd |

> edu_mmio_write

| addr | size (Byte) | info                       |
| ---- | ----------- | -------------------------- |
| 0x04 | 4           | EduState / addr4           |
| 0x08 | 4           | EduState / fact (Mutex)    |
| 0x20 | 4           | EduState / status          |
| 0x60 | 4           | edu_raise_irq              |
| 0x64 | 4           | edu_lower_irq              |
| 0x80 | 8           | EduState / dma_state / src |
| 0x88 | 8           | EduState / dma_state / dst |
| 0x90 | 8           | EduState / dma_state / cnt |
| 0x98 | 8           | EduState / dma_state / cmd |



### 2.2 DMA

```c
static void edu_dma_timer(void *opaque)
{
    EduState *edu = opaque;
    bool raise_irq = false;

    if (!(edu->dma.cmd & EDU_DMA_RUN)) {
        return;
    }

    if (EDU_DMA_DIR(edu->dma.cmd) == EDU_DMA_FROM_PCI) {
        uint64_t dst = edu->dma.dst;
        edu_check_range(dst, edu->dma.cnt, DMA_START, DMA_SIZE);
        dst -= DMA_START;
        pci_dma_read(&edu->pdev, edu_clamp_addr(edu, edu->dma.src),
                edu->dma_buf + dst, edu->dma.cnt);
    } else {
        uint64_t src = edu->dma.src;
        edu_check_range(src, edu->dma.cnt, DMA_START, DMA_SIZE);
        src -= DMA_START;
        pci_dma_write(&edu->pdev, edu_clamp_addr(edu, edu->dma.dst),
                edu->dma_buf + src, edu->dma.cnt);
    }

    edu->dma.cmd &= ~EDU_DMA_RUN;
    if (edu->dma.cmd & EDU_DMA_IRQ) {
        raise_irq = true;
    }

    if (raise_irq) {
        edu_raise_irq(edu, DMA_IRQ);
    }
}

static void dma_rw(EduState *edu, bool write, dma_addr_t *val, dma_addr_t *dma,
                bool timer)
{
    if (write && (edu->dma.cmd & EDU_DMA_RUN)) {
        return;
    }

    if (write) {
        *dma = *val;
    } else {
        *val = *dma;
    }

    if (timer) {
        timer_mod(&edu->dma_timer, qemu_clock_get_ms(QEMU_CLOCK_VIRTUAL) + 100);
    }
```

According to the members of `dma_state`, the state of DMA can be decided, is the last bit of `cmd` is 1. It means that DMA is running. The corresponding rw operation can be done with function `dma_rw` and the bool variable `write`.




