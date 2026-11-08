package com.reeceatkins.kalima

import android.graphics.Color
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
  private var webView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.TRANSPARENT
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    this.webView = webView
    webView.addJavascriptInterface(Bridge(), "KalimaNative")
  }

  inner class Bridge {
    @JavascriptInterface
    fun setTheme(dark: Boolean) {
      runOnUiThread { applyBarIcons(dark) }
    }
  }

  private fun applyBarIcons(dark: Boolean) {
    WindowCompat.getInsetsController(window, window.decorView).apply {
      isAppearanceLightStatusBars = !dark
      isAppearanceLightNavigationBars = !dark
    }
  }

  @Deprecated("Use the OnBackPressedDispatcher")
  override fun onBackPressed() {
    val view = webView
    if (view == null) {
      super.onBackPressed()
      return
    }

    view.evaluateJavascript(
      "(function(){try{return window.kalimaBack?window.kalimaBack():false}catch(e){return false}})()",
    ) { result ->
      if (result != "true") {
        @Suppress("DEPRECATION")
        super.onBackPressed()
      }
    }
  }
}
