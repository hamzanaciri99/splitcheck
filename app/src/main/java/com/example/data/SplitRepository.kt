package com.example.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class SplitRepository(private val splitDao: SplitDao) {
    val allReceipts: Flow<List<ReceiptEntity>> = splitDao.getAllReceipts()
    val allParticipants: Flow<List<ParticipantEntity>> = splitDao.getAllParticipants()

    fun getReceiptById(id: Int): Flow<ReceiptEntity?> = splitDao.getReceiptById(id)
    fun getItemsForReceipt(receiptId: Int): Flow<List<ReceiptItemEntity>> = splitDao.getItemsForReceipt(receiptId)

    suspend fun insertReceipt(receipt: ReceiptEntity): Long = splitDao.insertReceipt(receipt)
    suspend fun updateReceipt(receipt: ReceiptEntity) = splitDao.updateReceipt(receipt)
    suspend fun deleteReceipt(receipt: ReceiptEntity) = splitDao.deleteReceipt(receipt)

    suspend fun insertItems(items: List<ReceiptItemEntity>) = splitDao.insertItems(items)
    suspend fun insertItem(item: ReceiptItemEntity): Long = splitDao.insertItem(item)
    suspend fun updateItem(item: ReceiptItemEntity) = splitDao.updateItem(item)

    suspend fun insertParticipant(participant: ParticipantEntity): Long = splitDao.insertParticipant(participant)

    suspend fun preseedDataIfEmpty() {
        // Check if receipts are empty
        val currentReceipts = splitDao.getAllReceipts().first()
        if (currentReceipts.isEmpty()) {
            // Seed Participants
            val p1 = splitDao.insertParticipant(
                ParticipantEntity(
                    name = "Me",
                    avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCwH1BJhWoNjBZ72QbDPPIPLG_EMeugL_BMqXtwwKMv-h95i_xEq2bQlWY_Py0wXce_BIFDpm8Omr71Z2YZLsMXDic90GMcqEh5KDLXb2xhSiUoN27qy-2DCrmvo07ordIkrjpPtoxAZPxsW2Zj1iuGNz61L7-jv6rQIXE5cvouULOR_g_OIGuuVq4fQe3QFvX2x3HH2BiGN7xPjo--mAKFVXnrCSLdN13QPDw4u-gs1YEJ_oK7SW2Xr7ggV3iBHgCwiq9FZ8JbCDgg"
                )
            )
            val p2 = splitDao.insertParticipant(
                ParticipantEntity(
                    name = "Sarah",
                    avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCjdLq6Mu73IvglzxxOQqIx5mYGKmcwOTdvFmB2_GbA4LWtO4mvNKluZ39yUcVdiBM0o9OFlEmwDqjEi7zD9EeG-VY58JJiHAQzQVTX0JVk9Fg6AjqEA7EB1T0xh0O44FRbrnOFMzitq8VBb3IMRPHQbs7JjVcn298zA4DOZtq5FEftt3W4nmLReOnC2HGfAAjkZ4op33VNoEAPJrI27fUZzjgTSPNbqlHxKqSAmy4KgmB_jqNzJr56bG-nrfChWVNFZWqPRAKilnuU"
                )
            )
            val p3 = splitDao.insertParticipant(
                ParticipantEntity(
                    name = "Mike",
                    avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBMnUjA6YOqnSXYCr3mlOOoTziZX4_xNbkoL5tRmKmRLQBm53CcLjlSng6FJI9zfeDhGdKH1tTCgETauccB2-m5MQgiSoIsnAt5-JdOvocbzQgbHNlO5fRVK4Xd3gwoUnE-9GjEyc3FSDx_uLIbEAA6BURXK_Mnrr-2KtQaOUsdaXbxLK4RFs4emKSfbIJajbK3imsgptKfqH4MNbGnxp76Sluz-NhYICoWFDfbVPDheFxBHUmDJHSKsrz-gN8a3sG0YHheW5ukiRnF"
                )
            )
            val p4 = splitDao.insertParticipant(
                ParticipantEntity(
                    name = "Alex",
                    avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBP1U7MFp1ba6c0JpvVo-Btk5mtmRA0fGjHiGG5mBdosNLMtdzIQFiIuv4Li1d2pNKug1PPCrrr6h5n2dYrQDueLrbT7uuQwh81GMdJIvGp-m-ukSXc0p01HNKAzWbBbPKnTBMrnO-c8WyIU-bM8XyQflz7UEqHW5gZi-Nj8XJ7OhCP4tdHDx3wGhF5qcKiUy_O0r5iYezHK-bNlymAN94BG10ZsPPfp4oSyfjmMhqcrt-k0Gfgey1bDEpqtHjnWlwoegYiTpzn4uMl"
                )
            )

            // Seed Receipts
            val r1Id = splitDao.insertReceipt(
                ReceiptEntity(
                    title = "Dinner at Joe's",
                    date = "2h ago",
                    totalAmount = 45.0,
                    payer = "You",
                    isSettled = false,
                    timestamp = System.currentTimeMillis() - 2 * 60 * 60 * 1000
                )
            )
            splitDao.insertItems(listOf(
                ReceiptItemEntity(receiptId = r1Id.toInt(), name = "Special Cocktails", price = 15.0, assignedTo = "Me"),
                ReceiptItemEntity(receiptId = r1Id.toInt(), name = "Dinner Roast", price = 30.0, assignedTo = "Sarah,Mike")
            ))

            val r2Id = splitDao.insertReceipt(
                ReceiptEntity(
                    title = "Office Coffee Run",
                    date = "Yesterday",
                    totalAmount = 18.60,
                    payer = "Sarah",
                    isSettled = false,
                    timestamp = System.currentTimeMillis() - 24 * 60 * 60 * 1000
                )
            )
            splitDao.insertItems(listOf(
                ReceiptItemEntity(receiptId = r2Id.toInt(), name = "Latte Me", price = 6.20, assignedTo = "Me"),
                ReceiptItemEntity(receiptId = r2Id.toInt(), name = "Espresso Sarah", price = 6.20, assignedTo = "Sarah"),
                ReceiptItemEntity(receiptId = r2Id.toInt(), name = "Cortado Mike", price = 6.20, assignedTo = "Mike")
            ))

            val r3Id = splitDao.insertReceipt(
                ReceiptEntity(
                    title = "Weekly Groceries",
                    date = "Nov 12",
                    totalAmount = 120.0,
                    payer = "You",
                    isSettled = true,
                    timestamp = System.currentTimeMillis() - 5 * 24 * 60 * 60 * 1000
                )
            )
            splitDao.insertItems(listOf(
                ReceiptItemEntity(receiptId = r3Id.toInt(), name = "Veggies", price = 40.0, assignedTo = "Me,Sarah,Mike,Alex"),
                ReceiptItemEntity(receiptId = r3Id.toInt(), name = "Fruits", price = 30.0, assignedTo = "Me,Sarah,Mike,Alex"),
                ReceiptItemEntity(receiptId = r3Id.toInt(), name = "Dry goods", price = 50.0, assignedTo = "Me,Sarah,Mike,Alex")
            ))

            val r4Id = splitDao.insertReceipt(
                ReceiptEntity(
                    title = "Tapas Night",
                    date = "Nov 10",
                    totalAmount = 88.0,
                    payer = "Mike",
                    isSettled = false,
                    timestamp = System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000
                )
            )
            splitDao.insertItems(listOf(
                ReceiptItemEntity(receiptId = r4Id.toInt(), name = "Patatas Bravas", price = 22.0, assignedTo = "Me"),
                ReceiptItemEntity(receiptId = r4Id.toInt(), name = "Serrano Ham", price = 44.0, assignedTo = "Sarah,Mike"),
                ReceiptItemEntity(receiptId = r4Id.toInt(), name = "Sangria Pitcher", price = 22.0, assignedTo = "Me,Sarah,Mike,Alex")
            ))

            // Seeding "The Alchemist Bar & Grill" too for the summary screen display!
            val r5Id = splitDao.insertReceipt(
                ReceiptEntity(
                    title = "The Alchemist Bar & Grill",
                    date = "Oct 24, 2023",
                    totalAmount = 86.45,
                    payer = "You",
                    isSettled = false,
                    timestamp = System.currentTimeMillis() - 15 * 24 * 60 * 60 * 1000
                )
            )
            splitDao.insertItems(listOf(
                ReceiptItemEntity(receiptId = r5Id.toInt(), name = "Truffle Fries", price = 14.0, assignedTo = "Alex"),
                ReceiptItemEntity(receiptId = r5Id.toInt(), name = "Old Fashioned", price = 18.0, assignedTo = "Alex"),
                ReceiptItemEntity(receiptId = r5Id.toInt(), name = "Caesar Salad", price = 16.0, assignedTo = "Sarah"),
                ReceiptItemEntity(receiptId = r5Id.toInt(), name = "Tax & Tip Share (Assigned)", price = 23.25, assignedTo = "Alex,Sarah"),
                ReceiptItemEntity(receiptId = r5Id.toInt(), name = "Garlic Pizza Bread (Jordan Share)", price = 15.20, assignedTo = "") // Jordan Smith unassigned
            ))
        }
    }
}
