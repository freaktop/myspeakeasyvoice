package com.lovable.routinevoicepilot;

import android.os.Bundle;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable JS console logs in Android Logcat
        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                String msg = "JS [" + consoleMessage.messageLevel() + "] " + consoleMessage.message() +
                             " (line " + consoleMessage.lineNumber() + ")";
                if (consoleMessage.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                    Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT).show();
                    android.util.Log.e("JS_CONSOLE", msg);
                } else {
                    android.util.Log.d("JS_CONSOLE", msg);
                }
                return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Auto-grant microphone permission to WebView
                request.grant(request.getResources());
            }
        });
    }
}
