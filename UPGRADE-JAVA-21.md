# Upgrade to Java 21 (LTS)

This repository has been upgraded to target Java 21 (LTS) for Java compilation and Kotlin JVM target. This file summarizes the changes and the verification steps.

## What was changed
- Update Java language level and Kotlin jvmTarget for Android modules to Java 21 in `android/build.gradle` and `android/app/build.gradle`.
- Gradle toolchain usage enabled; `org.gradle.java.installations.auto-download=true` in `android/gradle.properties` to enable toolchain downloads when JDK 21 is not present locally.
- GitHub Actions has been updated to include a `build` matrix that tests Java 17 and Java 21, and `verify-toolchain` job that runs with Java 21.
- `scripts/install-jdk21.ps1` and `scripts/setup-android.ps1` include helpers and guidance for installing and setting `JAVA_HOME` to JDK 21 on developer machines.

## Verification
- Local Java 21 installation can be installed using `scripts/install-jdk21.ps1` on Windows.
- GitHub Actions workflow `build-android.yml` already exercises both Java 17 and Java 21 and includes checks for Java 21.
- Frontend `npm run build` succeeds in environment (unrelated to Java toolchain).

## Known limitations
- The Gradle wrapper (`android/gradle/wrapper/gradle-wrapper.properties`) points to Gradle 8.16 and will attempt to download a distribution during the first run. If the build environment restricts network access, the Gradle wrapper may fail to download the distribution and `./gradlew` will error.

## Next steps / Recommendations
1. Ensure CI has network access so Gradle wrapper can fetch the distribution; or install a `gradle` binary on the build hosts.
2. Set `JAVA_HOME` in CI or use `actions/setup-java` to ensure JDK 21 is present in the environment.
3. (Optional) If you rely on a specific Gradle version, update `gradle/wrapper/gradle-wrapper.properties` to your chosen version and check with a test build.
4. Run the Android builds locally using the wrapper (or local Gradle) to verify the full native build process.
5. Verify and fix any lint/test issues found by CI.
6. If the Gradle wrapper fails to download due to network restrictions or redirects, you have a few options:

- Run `scripts/fix-gradle-wrapper.ps1` on a Windows machine that has network access and administrative rights. This script attempts to install a local Gradle with Chocolatey and update the wrapper files (commit the resulting wrapper changes).
- If you cannot run Chocolatey or don't have admin rights, download the Gradle distribution zip on a machine with network access and copy it to `%USERPROFILE%\.gradle\wrapper\dists\` on the build host, or run the wrapper update there and commit the updated wrapper files.
- Use `scripts/install-gradle-zip.ps1 -ZipPath <path-to-zip>` to copy a pre-downloaded `gradle-8.16-all.zip` into your user's Gradle wrapper cache on Windows without admin rights (script will create the expected directory layout and copy it in).

Once the wrapper can access the distribution (either from the cache or via network), re-run `./gradlew` to verify it works.

If you prefer, I can continue and attempt to complete a full `generate_upgrade_plan` and automatic OpenRewrite/code modifications — however, this requires the ability to run the Gradle wrapper (which must be able to download Gradle distribution) or a locally installed Gradle binary present during the plan generation step.

---

Last updated: 2025-11-28
