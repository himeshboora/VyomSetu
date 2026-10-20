package com.vyomsetu.rescue

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : Activity() {

    private lateinit var monitoringPanel: LinearLayout
    private lateinit var emergencyPanel: LinearLayout
    private lateinit var timerText: TextView
    private lateinit var btnHelpNeeded: Button
    private lateinit var btnSafe: Button
    private var countDownTimer: CountDownTimer? = null

    // Listens for the impact signal from RescueService
    private val impactReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == "com.vyomsetu.IMPACT_ALERT") {
                triggerEmergencyUI()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        monitoringPanel = findViewById(R.id.monitoringPanel)
        emergencyPanel = findViewById(R.id.emergencyPanel)
        timerText = findViewById(R.id.timerText)
        btnHelpNeeded = findViewById(R.id.btnHelpNeeded)
        btnSafe = findViewById(R.id.btnSafe)

        // Start the background sensor service
        val serviceIntent = Intent(this, RescueService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        btnSafe.setOnClickListener { cancelEmergency() }
        btnHelpNeeded.setOnClickListener { sendSOSMessage() }
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter("com.vyomsetu.IMPACT_ALERT")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(impactReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(impactReceiver, filter)
        }
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(impactReceiver)
    }

    private fun triggerEmergencyUI() {
        runOnUiThread {
            monitoringPanel.visibility = View.GONE
            emergencyPanel.visibility = View.VISIBLE

            countDownTimer?.cancel()
            // 10-Second Countdown Timer
            countDownTimer = object : CountDownTimer(10000, 1000) {
                override fun onTick(millisUntilFinished: Long) {
                    timerText.text = (millisUntilFinished / 1000).toString()
                }
                override fun onFinish() { sendSOSMessage() }
            }.start()
        }
    }

    private fun cancelEmergency() {
        runOnUiThread {
            countDownTimer?.cancel()

            // Hide emergency panel and show monitoring panel
            emergencyPanel.visibility = View.GONE
            monitoringPanel.visibility = View.VISIBLE

            // RESET BUTTONS AND TEXT FOR THE NEXT ALERT
            btnHelpNeeded.isEnabled = true
            btnSafe.isEnabled = true
            btnSafe.text = "I'M SAFE (CANCEL)"
            timerText.text = "10"

            // Tell the background service to unlock the sensor
            val resetIntent = Intent(this, RescueService::class.java)
            resetIntent.action = "com.vyomsetu.RESET_SENSOR"
            startService(resetIntent)
        }
    }

    private fun sendSOSMessage() {
        runOnUiThread {
            countDownTimer?.cancel()
            timerText.text = "SOS SENT"

            // Disable the Help button to prevent spamming the Node.js server
            btnHelpNeeded.isEnabled = false

            // Keep the Safe button ENABLED and change text so you can reset the app
            btnSafe.isEnabled = true
            btnSafe.text = "RESET SYSTEM"
        }

        Log.e("VyomSetu", "🚨 SOS BROADCAST INITIATED!")

        thread {
            try {
                // Configured with your specific IP Address
                val url = URL("http://192.168.137.1:3000/api/impact")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; utf-8")
                conn.setRequestProperty("Accept", "application/json")
                conn.doOutput = true

                val jsonParam = JSONObject()
                jsonParam.put("deviceId", "SOS-07")
                jsonParam.put("gForce", 28.5)

                conn.outputStream.use { os ->
                    val input = jsonParam.toString().toByteArray(Charsets.UTF_8)
                    os.write(input, 0, input.size)
                }

                if (conn.responseCode == 200) {
                    Log.d("VyomSetu", "✅ SOS successfully received by Command Center!")
                } else {
                    Log.e("VyomSetu", "❌ Server rejected SOS. Code: ${conn.responseCode}")
                }
                conn.disconnect()

            } catch (e: Exception) {
                Log.e("VyomSetu", "❌ Network Error: ${e.message}")
            }
        }
    }
}