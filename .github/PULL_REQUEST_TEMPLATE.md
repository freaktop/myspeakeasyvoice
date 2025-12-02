# Summary
This PR upgrades the Android project to target Java 21 and ensures Kotlin JVM target is set to 21.

## Changes
- Enforced Java 21 in Gradle toolchain and `compileOptions` in `android/build.gradle` and `android/app/build.gradle`.
- Ensured `org.gradle.java.installations.auto-download=true` in `android/gradle.properties`.
- Added `UPGRADE-JAVA-21.md` documenting the upgrade rationale and verification steps.
- Added a helper script `scripts/fix-gradle-wrapper.ps1` to attempt to update the wrapper and/or install Gradle locally.

## QA Steps
- CI runs Java 17 & Java 21 matrix to validate compatibility.
- Verify `gradlew` runs on a development machine with JDK 21 and Gradle wrapper can download the distribution.

## Follow-ups
- If the Gradle wrapper fails to download due to network/redirect issues, run `scripts/fix-gradle-wrapper.ps1` in an elevated shell on a machine with network access and commit the wrapper updates.
