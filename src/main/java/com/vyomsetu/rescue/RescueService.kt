package com.vyomsetu.rescue

import android.app.*
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlin.math.sqrt

class RescueService : Service(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null

    // --- CONTINUOUS SHOCK DETECTION ALGORITHM ---
    private val SHOCK_THRESHOLD = 53.0f
    // UPDATED: Now requires 15 distinct shocks
    private val REQUIRED_SHOCKS = 15
    private val TIME_WINDOW_MS = 10000L
    private val DEBOUNCE_MS = 200L

    private var shockCount = 0
    private var firstShockTime = 0L
    private var lastShockTime = 0L
    private var isImpactDetected = false

    override fun onCreate() {
        super.onCreate()
        startForegroundService()
        initSensors()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "com.vyomsetu.RESET_SENSOR") {
            isImpactDetected = false
            shockCount = 0
            firstShockTime = 0L
        }
        return super.onStartCommand(intent, flags, startId)
    }

    private fun startForegroundService() {
        val channelId = "vyomsetu_rescue_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "VyomSetu Active Protection",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("VyomSetu Shield Active")
            .setContentText("Monitoring for sustained structural failure...")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .build()
        startForeground(1001, notification)
    }

    private fun initSensors() {
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_FASTEST)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_ACCELEROMETER) {
            val (x, y, z) = event.values
            val gForce = sqrt(x * x + y * y + z * z)

            if (gForce > SHOCK_THRESHOLD && !isImpactDetected) {
                val currentTime = System.currentTimeMillis()

                if (currentTime - lastShockTime > DEBOUNCE_MS) {

                    if (shockCount == 0) {
                        firstShockTime = currentTime
                    }

                    if (currentTime - firstShockTime <= TIME_WINDOW_MS) {
                        shockCount++
                        lastShockTime = currentTime
                        Log.d("VyomSetu", "Shock wave $shockCount/15 detected...")

                        if (shockCount >= REQUIRED_SHOCKS) {
                            isImpactDetected = true
                            Log.e("VyomSetu", "CRITICAL: Sustained Structural Failure Confirmed!")

                            val alertIntent = Intent("com.vyomsetu.IMPACT_ALERT")
                            alertIntent.setPackage(packageName)
                            sendBroadcast(alertIntent)

                            Handler(Looper.getMainLooper()).postDelayed({
                                isImpactDetected = false
                                shockCount = 0
                            }, 5000)
                        }
                    } else {
                        Log.d("VyomSetu", "Window expired. Was a false alarm. Resetting to 1.")
                        firstShockTime = currentTime
                        lastShockTime = currentTime
                        shockCount = 1
                    }
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    override fun onBind(intent: Intent?): IBinder? = null
}