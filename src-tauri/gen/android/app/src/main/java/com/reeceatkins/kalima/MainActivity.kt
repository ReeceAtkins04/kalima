package com.reeceatkins.kalima

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File
import kotlin.math.roundToInt

class MainActivity : TauriActivity() {
  private var webView: WebView? = null

  @Volatile private var insetTop = 0
  @Volatile private var insetBottom = 0
  @Volatile private var insetLeft = 0
  @Volatile private var insetRight = 0

  /** Let the web app close a sheet or leave a screen before the app exits. */
  private val backCallback = object : OnBackPressedCallback(true) {
    override fun handleOnBackPressed() {
      val view = webView
      if (view == null) {
        exitApp()
        return
      }

      view.evaluateJavascript(
        "(function(){try{return window.kalimaBack?window.kalimaBack():false}catch(e){return false}})()",
      ) { result ->
        if (result != "true") exitApp()
      }
    }

    private fun exitApp() {
      isEnabled = false
      onBackPressedDispatcher.onBackPressed()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.TRANSPARENT
    onBackPressedDispatcher.addCallback(this, backCallback)

    // Android WebView does not expose system bars through CSS env(), so the
    // insets are measured here and read by the frontend on boot and resize.
    val root = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(root) { _, insets ->
      val bars = insets.getInsets(
        WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout(),
      )
      val density = resources.displayMetrics.density
      insetTop = (bars.top / density).roundToInt()
      insetBottom = (bars.bottom / density).roundToInt()
      insetLeft = (bars.left / density).roundToInt()
      insetRight = (bars.right / density).roundToInt()
      insets
    }
    ViewCompat.requestApplyInsets(root)
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

    /** System bar and cutout insets in CSS pixels: top,bottom,left,right. */
    @JavascriptInterface
    fun getInsets(): String =
      "$insetTop,$insetBottom,$insetLeft,$insetRight"

    /**
     * Write a deck export to the app cache and open the system share sheet.
     * The WebView cannot use anchor downloads, so this replaces them.
     */
    @JavascriptInterface
    fun shareCsv(filename: String, contents: String) {
      runOnUiThread {
        try {
          val safeName = filename
            .replace(Regex("[^A-Za-z0-9._-]"), "_")
            .ifBlank { "kalima.csv" }
            .let { if (it.endsWith(".csv", ignoreCase = true)) it else "$it.csv" }

          val directory = File(cacheDir, "exports").apply { mkdirs() }
          val file = File(directory, safeName)
          file.writeText(contents, Charsets.UTF_8)

          val uri = FileProvider.getUriForFile(this@MainActivity, "$packageName.fileprovider", file)
          val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, safeName)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
          startActivity(Intent.createChooser(send, "Export CSV"))
        } catch (error: Exception) {
          Log.e("Kalima", "Could not share the CSV export", error)
        }
      }
    }
  }

  private fun applyBarIcons(dark: Boolean) {
    WindowCompat.getInsetsController(window, window.decorView).apply {
      isAppearanceLightStatusBars = !dark
      isAppearanceLightNavigationBars = !dark
    }
  }
}
