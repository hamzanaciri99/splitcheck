package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "receipts")
data class ReceiptEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val date: String,
    val totalAmount: Double,
    val payer: String = "You", // Who paid the whole bill
    val isSettled: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)
