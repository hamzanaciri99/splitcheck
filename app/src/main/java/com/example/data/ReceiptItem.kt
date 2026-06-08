package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "receipt_items")
data class ReceiptItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val receiptId: Int,
    val name: String,
    val price: Double,
    val assignedTo: String = "" // Comma-separated names of participants assigned to this item, e.g., "Me,Sarah"
)
