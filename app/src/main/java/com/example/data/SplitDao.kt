package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SplitDao {
    @Query("SELECT * FROM receipts ORDER BY timestamp DESC")
    fun getAllReceipts(): Flow<List<ReceiptEntity>>

    @Query("SELECT * FROM receipts WHERE id = :id")
    fun getReceiptById(id: Int): Flow<ReceiptEntity?>

    @Query("SELECT * FROM receipt_items WHERE receiptId = :receiptId")
    fun getItemsForReceipt(receiptId: Int): Flow<List<ReceiptItemEntity>>

    @Query("SELECT * FROM receipt_items WHERE receiptId = :receiptId")
    suspend fun getItemsForReceiptSync(receiptId: Int): List<ReceiptItemEntity>

    @Query("SELECT * FROM participants")
    fun getAllParticipants(): Flow<List<ParticipantEntity>>

    @Query("SELECT * FROM participants")
    suspend fun getAllParticipantsSync(): List<ParticipantEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReceipt(receipt: ReceiptEntity): Long

    @Update
    suspend fun updateReceipt(receipt: ReceiptEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItems(items: List<ReceiptItemEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: ReceiptItemEntity): Long

    @Update
    suspend fun updateItem(item: ReceiptItemEntity)

    @Delete
    suspend fun deleteReceipt(receipt: ReceiptEntity)

    @Query("DELETE FROM receipt_items WHERE receiptId = :receiptId")
    suspend fun deleteItemsForReceipt(receiptId: Int)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParticipant(participant: ParticipantEntity): Long

    @Query("DELETE FROM receipts")
    suspend fun deleteAllReceipts()

    @Query("DELETE FROM receipt_items")
    suspend fun deleteAllItems()

    @Query("DELETE FROM participants")
    suspend fun deleteAllParticipants()
}
