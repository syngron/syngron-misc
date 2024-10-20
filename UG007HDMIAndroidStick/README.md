Title: UG007 HDMI Android stick experiences
Date: 2012-12-23 15:01
Category: linux
Tags: linux, android, mediaserver
Author: syngron (syngron@gmail.com)
Slug: ug007-hdmi-android-stick-experiences

tl;dr: Manual to install Linux on the UG007 HDMI Android stick.
  
Just to clarify, I am not liable if you destroy your device with the
information given here. No guarantee given. If you follow this guide,
you do it on your own responsibility and risk.  
  

### Order process

I recently ordered a UG007 HDMI Android stick on
[geekbuying](http://www.geekbuying.com/) for around 50 €. The package
took around 3 weeks to arrive in Germany and was unfortunately first
blocked by German customs. After paying the import tax (19%) I could
finally take it home.  
  

### WIFI problems

For 50 € (+ 10 € taxes) it is an amazing piece of hardware! It worked
out of the box quite good, only the **WIFI** made sometimes **problems**
as mentioned by other users. To fix this, it actually helped to **change
the power supply**. If I use as the power supply my cell phone charger
or my laptop USB port the wifi works permanently. Must be some issues
with too less or too much voltage with the shipped power supply.  
  

### Rooting the device

I wanted to use the stick as a media and gaming platform. So the first
thing I tried was to root it, to be able to install the sixaxis software
to use my Playstation 3 bluetooth controller with it.  
  
To root the device from a Linux (Arch Linux) machine I did the
following:  

1.  plug the USB cable to power the stick in the Laptop
2.  check the **Settings -&gt; USB -&gt; Connect to PC** box on the
    stick
3.  check the **Settings -&gt; Developer options -&gt; USB debugging**
    box on the stick
4.  check on the Laptop the hardware ID of the stick with **lsusb** (the
    4 digits before the colon, mine was 2207 it did not show any vendor
    string though).
5.  add a udev rule **/etc/udev/rules.d/51-android.rules** with the
    content **SUBSYSTEM=="usb", ATTR{idVendor}=="0x2207", MODE="0666"**
    (of course change 2207 here to your hardware id).
6.  make it executable **chmod +x /etc/udev/rules.d/51-android.rules**
7.  restart udev
8.  after that the device should be visible with the command **adb
    devices** (adb comes with the android sdk)
9.  Get the root files with busybox from somewhere
    (I used TPSarky-VonDroid-Root)
10. Execute the following (probably some commands are redundant here):

-   adb shell mv /data/local/tmp /data/local/tmp.bak
-   adb shell ln -s /data /data/local/tmp
-   adb reboot
-   adb shell rm /data/local.prop &gt; nul
-   adb reboot
-   adb shell id
-   adb remount
-   adb push su /system/bin/su
-   adb shell chown root.shell /system/bin/su
-   adb shell chmod 6755 /system/bin/su
-   adb push busybox /system/bin/busybox
-   adb shell chown root.shell /system/bin/busybox
-   adb shell chmod 0755 /system/bin/busybox
-   adb shell chown root.root /system/app/SuperSU.apk
-   adb shell chmod 0644 /system/app/SuperSU.apk
-   adb push RootExplorer.apk /system/app/RootExplorer.apk
-   adb shell chown root.root /system/app/RootExplorer.apk
-   adb shell chmod 0644 /system/app/RootExplorer.apk
-   adb shell rm /data/local.prop
-   adb shell rm /data/local/tmp
-   adb shell mv /data/local/tmp.bak /data/local/tmp
-   adb reboot

And that's it. The stick is rooted now.  
  

### Sixaxis PS3 controller over bluetooth

After that I installed the **sixaxis** app on the stick. The trick here
is to **change the master adress** of the controller to the one of the
stick. When running the sixaxis app, the bluetooth adress of the stick
should be shown at the bottom. On my Linux laptop I used the controller
before with the **qtsixa** application which is available in the AUR.
This package also ships an application called **sixpair** which takes as
an argument a bluetooth hardware adress. So after connecting the
controller to my Linux box with USB and changing the hardware adress
with sixpair it was working on the Android stick.  
Btw for Linux I can recommend also the application **qjoypad** which
allows to remap all the keys of the controller to keyboard events. It is
possible e.g. to map the motion sensors to mouse movements. Otherwise
there is also the package **xf86-input-joystick** available in the extra
repository which allows X11 controls with the controller.  
  

### Flashing Linux

This was already nice but I was not completely satisfied with the
Android system, I am used to use bash or python scripts extensively to
automate tasks which was not so easy on the Android system. Furthermore
the behaviour of Android with a connected mouse and keyboard still feels
not right. You always have to think in touch screen ways. So I wanted to
flash Linux on the stick.  
  
Luckily there is this guy AndrewDB on the slatedroid forums which
created a Linux image for the Rockchip based Android sticks (thanks for
that!):  
<http://www.slatedroid.com/topic/41654-pre-alpha-03-ubuntu-linux-for-mk802-iii-ug802-mk808-ug007-imito-mx1/>  
  
The only problem is that all the tutorials are based on flashing the
device from a Windows box. Flashing Linux on an Android stick from
Windows, why not use also Linux in the first place?  
  
The flashing works basically by setting the stick to a flashing mode and
overwriting the recovery partition which is **/dev/block/mtdblock3** on
the stick. In the slatedroid forum thread a guy named Patola had success
by just using cat to overwrite the recovery partition with the zero
padded kernel image (the partition has 16 mb the kernel image is around
8 mb).  
  
I tried several things:  

-   Padding the kernel image with zeros:  **dd if=/dev/zero bs=1
    count=8536064 &gt;&gt; kernel-0.3\_pad.img** (8536064 is the
    difference in byte between 16 mb and the kernel image size)
-   Then overwriting the partition with dd: **dd if=kernel.img
    of=/dev/block/mtdblock3 bs=8192** (I also tried different
    block sizes)
-   Overwriting it with cat: **cat kernel.img &gt;
    /dev/block/mtdblock3**
-   First overwriting the partition with zeros: **dd if=/dev/zero
    of=/dev/block/mtdblock3 bs=8192 **and then doing the above

<div>

Unfortunately all of the above methods did not properly overwrite the
partition, each time the compare command **cmp** yielded a different
byte in the partition and the image used. A restart of the stick into
recovery mode (**reboot recovery**) which should boot the recovery
partition just brought up a blank screen. Maybe I would need to set the
stick into flashing mode first somehow (**reboot bootloader**) but I
thought of this only afterwards.

</div>

<div>

  

</div>

<div>

So in the end I had to try it with the Windows flashing tool
RKAndroidTools. With wine it didn't recognise the stick, so I tried it
with virtualbox. Here I had to first setup properly the USB device which
needs the **virtualbox-ext-oracle** package available from AUR. With
this package I was able to see the stick in the Windows XP virtual
machine (after activating USB 2.0 support in the virtual machine
settings). I was then able to flash the recovery image with the
RKAndroidTools as described in the README. The flashing tool is
available from the custom Finless Android image which is available on
the freaktab forums. I basically followed the readme included but in the
tool **only checked the recovery checkbox** to not overwrite my Android
image too. Before flashing I exchanged the recovery.img of the tool with
my linux kernel image. Btw if you do let the other checkboxes checked,
it should install the Finless Android image which is already rooted, so
the process of rooting described above is not necessary anymore (however
I did not test this).

</div>

  
After creating a Ubuntu memory card as described in the forum thread by
formatting it with **gparted** to **ext4** and label it **linuxroot** I
can now boot into Ubuntu by executing **reboot recovery** on the stick.
:)  
  
Btw the Ubuntu image from AndrewDB needs a 4 GB stick, I only had a 2 GB
one around so I deleted the folders /var/cache /usr/share/help
/usr/share/doc and all locales but the english ones from
/usr/share/locale/. This brought the image down to less than 2 GB while
keeping all the functionality I needed.  
  
  

</p>

