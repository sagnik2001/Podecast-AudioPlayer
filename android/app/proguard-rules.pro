# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep app entry points and media services referenced by Android manifests and
# React Native background playback. Library consumer rules still handle most
# React Native/native-module internals.
-keep class com.podcastplayer.** { *; }
-keep class com.doublesymmetry.trackplayer.service.** { *; }

# WatermelonDB — keep native bridge classes used reflectively from JS.
-keep class com.nozbe.watermelondb.** { *; }
