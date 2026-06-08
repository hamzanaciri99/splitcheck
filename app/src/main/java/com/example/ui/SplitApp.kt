package com.example.ui

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.data.ReceiptEntity
import com.example.data.ReceiptItemEntity

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun SplitApp(
    viewModel: SplitViewModel,
    modifier: Modifier = Modifier
) {
    val currentScreen by viewModel.currentScreen.collectAsStateWithLifecycle()
    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
    val context = LocalContext.current

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            if (currentScreen == Screen.DASHBOARD) {
                SplitBottomNavBar(
                    currentTab = currentTab,
                    onTabSelected = { viewModel.selectTab(it) }
                )
            }
        }
    ) { innerPadding ->
        AnimatedContent(
            targetState = currentScreen,
            transitionSpec = {
                fadeIn(animationSpec = tween(220)) with fadeOut(animationSpec = tween(220))
            },
            modifier = Modifier.padding(innerPadding),
            label = "screen_navigation"
        ) { screen ->
            when (screen) {
                Screen.DASHBOARD -> {
                    when (currentTab) {
                        NavTab.ACTIVITY -> ActivityDashboardScreen(viewModel)
                        NavTab.GROUPS -> DummyGroupsScreen()
                        NavTab.HISTORY -> DummyHistoryScreen(viewModel)
                        NavTab.PROFILE -> DummyProfileScreen()
                    }
                }
                Screen.CAMERA_SCAN -> CameraScanScreen(viewModel)
                Screen.SELECT_ITEMS -> SelectItemsScreen(viewModel)
                Screen.SPLIT_SUMMARY -> SplitSummaryScreen(viewModel)
            }
        }
    }
}

// 1. DASHBOARD OVERVIEW SCREEN
@Composable
fun ActivityDashboardScreen(viewModel: SplitViewModel) {
    val state by viewModel.dashboardUiState.collectAsStateWithLifecycle()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 88.dp) // space for FAB
        ) {
            // Top App Bar Header
            DashboardHeader()

            Spacer(modifier = Modifier.height(8.dp))

            // Summary Balance Bento Grid Card
            BalanceBentoSection(
                totalBalance = state.totalBalance,
                owedToYou = state.owedToYou,
                youOwe = state.youOwe,
                onSettleUp = {
                    viewModel.settleAllBalances()
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Recent Activity Title Section
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Activity",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                TextButton(
                    onClick = { /* View All Action */ },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text(text = "View all", fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Activities List List
            if (state.activities.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No scanning activities yet.\nTap 'Scan Receipt' below to split a bill!",
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    state.activities.forEach { act ->
                        ActivityItemRow(
                            item = act,
                            onClick = {
                                viewModel.viewReceiptSummary(act.id)
                            }
                        )
                    }
                }
            }
        }

        // Floating Action Button for Scanner
        ExtendedFloatingActionButton(
            onClick = { viewModel.startScan() },
            icon = { Icon(Icons.Default.ReceiptLong, contentDescription = null) },
            text = { Text("Scan Receipt", fontWeight = FontWeight.Bold) },
            containerColor = MaterialTheme.colorScheme.primaryContainer,
            contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 24.dp, bottom = 24.dp)
                .testTag("scan_receipt_fab")
        )
    }
}

@Composable
fun DashboardHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            IconButton(
                onClick = {},
                modifier = Modifier
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            ) {
                Icon(
                    Icons.Default.Menu,
                    contentDescription = "Menu",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
            Text(
                text = "SplitCheck",
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.primary
            )
        }

        IconButton(
            onClick = {},
            modifier = Modifier
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            Icon(
                Icons.Default.Notifications,
                contentDescription = "Notifications",
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun BalanceBentoSection(
    totalBalance: Double,
    owedToYou: Double,
    youOwe: Double,
    onSettleUp: () -> Unit
) {
    val formattedBalance = String.format("$%.2f", Math.abs(totalBalance))
    val isOwed = totalBalance >= 0.0

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Main Total Balance Card
        Card(
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("total_balance_card"),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .drawBehind {
                        // Custom glass blob background decoration
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(Color.White.copy(alpha = 0.15f), Color.Transparent),
                                center = Offset(size.width * 0.9f, size.height * 0.1f)
                            ),
                            radius = size.width * 0.4f
                        )
                    }
                    .padding(24.dp)
            ) {
                Column {
                    Text(
                        text = "Total Balance",
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.82f),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = formattedBalance,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        fontSize = 38.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = (-1).sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = if (isOwed) Icons.AutoMirrored.Filled.TrendingUp else Icons.Default.TrendingDown,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = if (isOwed) "You are owed" else "You owe overall",
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Button(
                            onClick = onSettleUp,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.surface,
                                contentColor = MaterialTheme.colorScheme.primary
                            ),
                            shape = RoundedCornerShape(100.dp),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp),
                            modifier = Modifier.testTag("settle_up_button")
                        ) {
                            Text(
                                text = "Settle Up",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }
                }
            }
        }

        // Sub Bento grid (Owed to you and you owe side-by-side)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Owed to you bento
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)),
                modifier = Modifier
                    .weight(1f)
                    .testTag("owed_to_you_bento")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(bottom = 6.dp)
                    ) {
                        Icon(
                            Icons.Default.AccountBalanceWallet,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Owed to you",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    }
                    Text(
                        text = String.format("$%.2f", owedToYou),
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                }
            }

            // You owe bento
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)),
                modifier = Modifier
                    .weight(1f)
                    .testTag("you_owe_bento")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(bottom = 6.dp)
                    ) {
                        Icon(
                            Icons.Default.Payments,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "You owe",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                    Text(
                        text = String.format("$%.2f", youOwe),
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
fun ActivityItemRow(
    item: ActivityItem,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("activity_row_${item.id}"),
        border = BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.25f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Dynamic Avatar Image fallback
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.secondaryContainer),
                contentAlignment = Alignment.Center
            ) {
                // Return dynamic picture depending on merchant title
                val imageMap = mapOf(
                    "Dinner at Joe's" to "https://lh3.googleusercontent.com/aida-public/AB6AXuDCTZc4ERwKI6keIrVr7KFHJXJzIW1aykSAsUK3QnSGEt2m4V5MKwMOKMKbFNzzZsWByl9cvH270YCAf2NVY51nY-zdbnRKV41rRAbtssgG6aEeEVo6nmbQaGktOxPzk6UzO-Ivq2Jer0cy6Qc2K1XJEcFVq7BAfHU0bLVGFku3f1JNifcmX12_6TnfHj_LxCDYGpqTkss4BEPzFksFEN4JlMqGJMdvP9sCPUYbqQjKVNjJgSwbhrPCvF6QzEveLuntvJbdAvxy7Qd1",
                    "Office Coffee Run" to "https://lh3.googleusercontent.com/aida-public/AB6AXuCXLmxp2eCchs3xaplFnKW-dVkwRGVMO23FUQ-cziipbMev9T0GCqMJQS_py-C_pPy84n9SxGDMf0Y7qulc6HxygR7WZ5Nb-wSVtPMpDXCU80zBwgOid4zANMUsLn5Gkyjae7pbAzCUYCLqK-Gb6y-rY4O5xuFBKgw_Oy87_95U-N503gDYEjIhnKiuf8-kBvbVAZHGaRc9dy8M2V-WS8DIjTi-YxCPupeAgpfszvK_ZyNWp5v03omuR4gL14xTZZgD2C0PHIBGLDqv",
                    "Weekly Groceries" to "https://lh3.googleusercontent.com/aida-public/AB6AXuAFFJ2mYVnkdL5g_h8XKkw6T1Ci_IMv9sK3ZBOt8ljns0SQe6g3EUQJGhA8D3BMnaSLs9pCzjGySy_viGj_Wul0-PpCaqUMfGOykUnk0sKgxKyC_LqWgjhdTW_Z_ekW6vgTADaMXVEKABQtfG3ViALHurq6cjpprkD-3q-c-nZQkjMhw3ghzxezg_V0SwYOJjGthqTjUmhT-GgEGNkSXVb8A35xXdXv5PKvhpGRRH0oeA1rpZmiZAIBVMN643CiFWesCaAXSOs21H00",
                    "Tapas Night" to "https://lh3.googleusercontent.com/aida-public/AB6AXuC8WjZhEUIWL4XsTmNUpNxrtK22wzb6qvfxWVXfoWUG4pOSA5HLEv6K9FQLltf7WO5tfZ0aZODlQjezdq-TGfiajKfcaTpaXBxbDlfKDz3fjHyaNgxu5r-ZJ4gDBLxCY9QY5JZ4n1qj8e4WHrx5C6AhVKQSou4qC7_DKGIvD1qrDFSayYOPpsOo0ZGnzqedor2lPQz28KruDWphEc0n4Wg4lAwHrh_wEynnjLUezVN9-Gr1t83sRhs1Na2yAPlyZKX5IMdACaGfNlIk"
                )
                val targetUrl = imageMap[item.title] ?: ""

                if (targetUrl.isNotEmpty()) {
                    AsyncImage(
                        model = targetUrl,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Icon(
                        Icons.Default.ReceiptLong,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    if (item.isSettled) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Settled",
                            tint = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "Settled",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    } else {
                        Text(
                            text = item.subtitle,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Column(horizontalAlignment = Alignment.End) {
                val sign = if (item.isOwedToYou) "+" else "-"
                val textColor = if (item.isOwedToYou) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.error

                Text(
                    text = String.format("%s$%.2f", sign, item.amount),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = if (item.isOwedToYou) "Your share: $%.2f".format(item.amount / 3.0) else "You owe ${item.payer}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}


// 2. CAMERA VIEWFINDER SCAN SCREEN
@Composable
fun CameraScanScreen(viewModel: SplitViewModel) {
    val isScanning by viewModel.isScanning.collectAsStateWithLifecycle()
    val scanProgress by viewModel.scanProgress.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val primaryColor = MaterialTheme.colorScheme.primary
    val primaryContainerColor = MaterialTheme.colorScheme.primaryContainer

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Simulated full screen live camera preview of table receipt
        AsyncImage(
            model = "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ1bjxwL8mu8LPgtp1oQLmTrPD4Onht42-TcnLo-YnODaOHZXU1sjUybMkxsEVA8lNzi_VKLvQcM4OmChP_o2Kp-EvYP8JzLfj-3BZrcRyLEoZReEWJS2G9_zd7tGbf9c6jZyyNMF2gyN2d1C6E_VXGhKt8Dss-VuXeqZksabfTkwe6NXtXRP1EF1x_FklJnJCvi_Xij0i64iya0vKf7SnubUPQPm9TsQYBj3oe-p5-AndmYAb36MwQSSuBICKO1hhfAo5SppjyzbR",
            contentDescription = "Live feed of restaurant receipt",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Backdrop tint to darken un-scanned boundaries
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.4f))
        )

        // Standard Top bar controls inside camera view
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { viewModel.navigateTo(Screen.DASHBOARD) },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.2f))
            ) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
            }

            // Badge active auto focus
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier
                    .clip(RoundedCornerShape(100.dp))
                    .background(Color.White.copy(alpha = 0.22f))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.tertiary)
                )
                Text("Auto-Focus Active", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            IconButton(
                onClick = {},
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.2f))
            ) {
                Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
            }
        }

        // Viewfinder Center Framing Guide
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth(0.72f)
                .aspectRatio(9f / 16f)
                .border(2.dp, Color.White.copy(alpha = 0.40f), RoundedCornerShape(16.dp))
                .padding(4.dp)
        ) {
            // Viewfinder Corner Brackets Decoration
            Box(modifier = Modifier.fillMaxSize()) {
                val length = 28.dp
                val thickness = 4.dp
                val cornerColor = MaterialTheme.colorScheme.primaryContainer

                // Top-Left corner accent
                Box(
                    modifier = Modifier
                        .size(length)
                        .align(Alignment.TopStart)
                        .drawBehind {
                            drawRect(cornerColor, Offset.Zero, size = size.copy(width = thickness.toPx()))
                            drawRect(cornerColor, Offset.Zero, size = size.copy(height = thickness.toPx()))
                        }
                )

                // Top-Right corner accent
                Box(
                    modifier = Modifier
                        .size(length)
                        .align(Alignment.TopEnd)
                        .drawBehind {
                            drawRect(
                                cornerColor,
                                Offset(size.width - thickness.toPx(), 0f),
                                size = size.copy(width = thickness.toPx())
                            )
                            drawRect(cornerColor, Offset.Zero, size = size.copy(height = thickness.toPx()))
                        }
                )

                // Bottom-Left corner accent
                Box(
                    modifier = Modifier
                        .size(length)
                        .align(Alignment.BottomStart)
                        .drawBehind {
                            drawRect(cornerColor, Offset.Zero, size = size.copy(width = thickness.toPx()))
                            drawRect(
                                cornerColor,
                                Offset(0f, size.height - thickness.toPx()),
                                size = size.copy(height = thickness.toPx())
                            )
                        }
                )

                // Bottom-Right corner accent
                Box(
                    modifier = Modifier
                        .size(length)
                        .align(Alignment.BottomEnd)
                        .drawBehind {
                            drawRect(
                                cornerColor,
                                Offset(size.width - thickness.toPx(), 0f),
                                size = size.copy(width = thickness.toPx())
                            )
                            drawRect(
                                cornerColor,
                                Offset(0f, size.height - thickness.toPx()),
                                size = size.copy(height = thickness.toPx())
                            )
                        }
                )
            }

            // Scanning Horizontal Line Sim
            if (isScanning) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .fillMaxHeight(0.01f)
                        .align(Alignment.Center)
                        .background(
                            Brush.verticalGradient(
                                listOf(primaryColor, Color.Transparent)
                            )
                        )
                        .drawBehind {
                            drawRect(primaryContainerColor)
                        }
                )
            }
        }

        // Active Scan Progress Overlay
        if (isScanning) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    CircularProgressIndicator(
                        progress = { scanProgress },
                        color = Color.White,
                        strokeWidth = 4.dp
                    )
                    Text(
                        text = "Analyzing Receipt...",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                }
            }
        }

        // Contextual Information hovering glass card
        if (!isScanning) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.62f)),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 145.dp)
                    .fillMaxWidth(0.88f)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.25f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Lightbulb,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primaryContainer
                        )
                    }

                    Column {
                        Text("Pro Tip", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(
                            "Ensure all edges of the receipt are visible for 100% accuracy.",
                            color = Color.White.copy(alpha = 0.72f),
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        // Capture Controls Bottom Area
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(bottom = 32.dp, start = 24.dp, end = 24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Gallery Selector Preview on bottom left
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                IconButton(
                    onClick = {
                        viewModel.captureAndScan {
                            Toast.makeText(context, "Loaded from gallery!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier
                        .size(52.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .border(2.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                ) {
                    AsyncImage(
                        model = "https://lh3.googleusercontent.com/aida-public/AB6AXuDC4L6gdqTxW4ZoU3lLfZXpTE-ot_JbGaGlRjNzSEzAxddMdHSRHV8zkaNVDHNBGC07B_HkmRwdkQk92Y13yjKgKd1GFy33wpu47f_7YAkK8JEs0t-Ik5YK-QvkAeEQkFFoRssNCwdivDiDLM_OqoX_GeDyQnJD1LMA-vuCs6Pg4GMpYgx8zX5pIBuKm4MRGsxL3bxJEhCU4Cd64n3Ht0sLKEXRIMzspn2Jld9BD30Ds9pZUG0C3C3VREWMQk6XOSjJtr3fgWXzutSB",
                        contentDescription = "Gallery",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
                Text("GALLERY", color = Color.White.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            // Big Shutter capture button inside gradient container
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(80.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
                )
                IconButton(
                    onClick = {
                        viewModel.captureAndScan {
                            Toast.makeText(context, "Receipt Scanned!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier
                        .size(70.dp)
                        .clip(CircleShape)
                        .background(Color.White)
                        .border(4.dp, MaterialTheme.colorScheme.primary, CircleShape)
                        .testTag("shutter_button")
                ) {}
            }

            // Help instruction/manual guide switch on bottom right
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                IconButton(
                    onClick = {},
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.25f))
                ) {
                    Icon(Icons.Default.Help, contentDescription = "Guide", tint = Color.White)
                }
                Text("GUIDE", color = Color.White.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}


// 3. SELECT ITEMS SCANNED RECEIPT LIST & PARTICIPANTS ALLOCATION SCREEN
@Composable
fun SelectItemsScreen(viewModel: SplitViewModel) {
    val state by viewModel.assignmentState.collectAsStateWithLifecycle()
    var showAddPersonDialog by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val activeItem = state.items.getOrNull(state.selectedItemIndex)
    val assignedCount = state.items.count { it.assignedTo.isNotEmpty() }
    val totalCount = state.items.size

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 290.dp) // space for bottom assignment controller
        ) {
            // Screen header app bar sim
            DashboardHeader()

            Spacer(modifier = Modifier.height(16.dp))

            // Subheader instructions
            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                Text(
                    text = "Select items",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Tap items to assign them to your group members.",
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Scanned Item rows list items
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                state.items.forEachIndexed { idx, item ->
                    val isSelected = idx == state.selectedItemIndex
                    val itemBg = if (isSelected) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
                    val borderStroke = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primaryContainer) else BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = itemBg),
                        border = borderStroke,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.selectItem(idx) }
                            .testTag("scanned_item_$idx")
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                // Round checkbox indicator
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(if (item.assignedTo.isNotEmpty()) MaterialTheme.colorScheme.primaryContainer else Color.Transparent)
                                        .border(2.dp, if (item.assignedTo.isNotEmpty()) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.outlineVariant, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (item.assignedTo.isNotEmpty()) {
                                        Icon(
                                            Icons.Default.Check,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }

                                Column {
                                    Text(
                                        text = item.name,
                                        fontSize = 16.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    if (item.assignedTo.isNotEmpty()) {
                                        Text(
                                            text = "Assigned to: " + item.assignedTo.joinToString(", "),
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.primary,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }

                            Text(
                                text = String.format("$%.2f", item.price),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Assignment Progress Section Indicator
            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "ASSIGNMENT PROGRESS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "$assignedCount / $totalCount Assigned",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                val progress = if (totalCount > 0) assignedCount.toFloat() / totalCount else 0f
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(CircleShape),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
        }

        // Sticky Bottom Assignment Drawer
        Card(
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .wrapContentHeight()
                .navigationBarsPadding()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 18.dp, horizontal = 20.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Assign to",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 1.sp
                    )
                    TextButton(onClick = { showAddPersonDialog = true }) {
                        Text("Add Member", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }

                // Horizontal avatars list of people to tap assign
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(state.participants) { person ->
                        val isAssignedToActive = activeItem?.assignedTo?.contains(person.name) == true

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.clickable {
                                viewModel.toggleParticipantForSelectedItem(person.name)
                            }
                        ) {
                            Box(contentAlignment = Alignment.BottomEnd) {
                                // Grayscale effect filter if this person is not split-assigned to active selected item
                                val saturation = if (isAssignedToActive) 1f else 0.1f
                                val avatarBorder = if (isAssignedToActive) {
                                    BorderStroke(2.dp, MaterialTheme.colorScheme.primaryContainer)
                                } else {
                                    BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                }

                                Box(
                                    modifier = Modifier
                                        .size(56.dp)
                                        .clip(CircleShape)
                                        .border(avatarBorder, CircleShape)
                                        .background(MaterialTheme.colorScheme.secondaryContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (person.avatarUrl.isNotEmpty()) {
                                        AsyncImage(
                                            model = person.avatarUrl,
                                            contentDescription = person.name,
                                            contentScale = ContentScale.Crop,
                                            colorFilter = ColorFilter.colorMatrix(ColorMatrix().apply { setToSaturation(saturation) }),
                                            modifier = Modifier.fillMaxSize()
                                        )
                                    } else {
                                        Text(
                                            text = person.name.take(2).uppercase(),
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            color = if (isAssignedToActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }

                                if (isAssignedToActive) {
                                    Box(
                                        modifier = Modifier
                                            .size(18.dp)
                                            .clip(CircleShape)
                                            .background(MaterialTheme.colorScheme.primaryContainer)
                                            .border(1.5.dp, Color.White, CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Default.Check,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(10.dp)
                                        )
                                    }
                                }
                            }

                            Text(
                                text = person.name,
                                fontSize = 12.sp,
                                fontWeight = if (isAssignedToActive) FontWeight.Bold else FontWeight.Medium,
                                color = if (isAssignedToActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Dash add new button at summary list
                    item {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.clickable { showAddPersonDialog = true }
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(CircleShape)
                                    .drawBehind {
                                        // Draw a dash outline circle
                                        val dashStroke = androidx.compose.ui.graphics.drawscope.Stroke(
                                            width = 1.5.dp.toPx(),
                                            pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(
                                                floatArrayOf(10f, 10f), 0f
                                            )
                                        )
                                        drawCircle(color = Color.LightGray, style = dashStroke)
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Add Member", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text(text = "Add", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Done Button Actions
                Button(
                    onClick = { viewModel.completeSplitReceipt() },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .testTag("complete_assignment_button")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Done", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        Icon(Icons.Default.ArrowForward, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
                    }
                }
            }
        }
    }

    // Modal dialog to add person dynamically
    if (showAddPersonDialog) {
        var inputName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddPersonDialog = false },
            title = { Text("Add Group Member") },
            text = {
                OutlinedTextField(
                    value = inputName,
                    onValueChange = { inputName = it },
                    label = { Text("Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("add_person_input")
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputName.isNotBlank()) {
                            viewModel.addCustomParticipant(inputName.trim())
                            showAddPersonDialog = false
                        }
                    },
                    modifier = Modifier.testTag("confirm_add_person")
                ) {
                    Text("Add")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddPersonDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}


// 4. SPLIT SUMMARY OUTCOME SCREEN
@Composable
fun SplitSummaryScreen(viewModel: SplitViewModel) {
    val activeReceipt by viewModel.activeReceipt.collectAsStateWithLifecycle()
    val activeReceiptItems by viewModel.activeReceiptItems.collectAsStateWithLifecycle()
    val participants by viewModel.assignmentState.collectAsStateWithLifecycle()

    val context = LocalContext.current

    val title = activeReceipt?.title ?: "Split Summary"
    val subtitle = (activeReceipt?.date ?: "") + (if (activeReceipt?.payer != null) " • Paid by ${activeReceipt?.payer}" else "• Split detail")

    // Items assigned status
    val assignedItemCount = activeReceiptItems.count { it.assignedTo.isNotEmpty() }
    val totalItemCount = activeReceiptItems.size
    val progressPercentage = if (totalItemCount > 0) (assignedItemCount * 100) / totalItemCount else 100

    val totalAmount = activeReceipt?.totalAmount ?: 0.0

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 120.dp) // space for floating bottom settlement summary
        ) {
            // Dynamic app bar back icon row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { viewModel.navigateTo(Screen.DASHBOARD) },
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                Text(
                    text = "SplitCheck",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                IconButton(
                    onClick = { viewModel.navigateTo(Screen.DASHBOARD) },
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Icon(
                        Icons.Default.Home,
                        contentDescription = "Home",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Heading Merchant Details
            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                Text(
                    text = title,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subtitle,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Assigned progress bar
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Assigned Items", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
                        Text("$progressPercentage% Complete", fontSize = 13.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    LinearProgressIndicator(
                        progress = { progressPercentage / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(CircleShape),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Participant Split allocation Cards section list
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Group members mapped to their item allocation
                participants.participants.forEach { person ->
                    // Calculate and collect items assigned specifically to this person
                    val assignedItems = activeReceiptItems.filter { item ->
                        item.assignedTo.split(",").contains(person.name)
                    }

                    if (assignedItems.isNotEmpty()) {
                        // Calculate their shared cost
                        var sharedCostTotal = 0.0
                        assignedItems.forEach { item ->
                            val splitCount = item.assignedTo.split(",").size.coerceAtLeast(1)
                            sharedCostTotal += item.price / splitCount
                        }

                        ParticipantSplitDetailCard(
                            person = person,
                            assignedItems = assignedItems,
                            sharedCostTotal = sharedCostTotal,
                            activeReceiptItems = activeReceiptItems,
                            onRequestClick = {
                                Toast.makeText(context, "Payment request for $%.2f sent to %s!".format(sharedCostTotal, person.name), Toast.LENGTH_LONG).show()
                            }
                        )
                    }
                }

                // Unassigned Items warning Card (e.g. Jordan Smith / General unassigned)
                val unassignedItems = activeReceiptItems.filter { it.assignedTo.isEmpty() }
                if (unassignedItems.isNotEmpty()) {
                    val unassignedSum = unassignedItems.sumOf { it.price }

                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.5.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.error.copy(alpha = 0.1f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                                }

                                Column {
                                    Text("Unassigned Balance", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
                                    Text("${unassignedItems.size} items outstanding", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = String.format("$%.2f", unassignedSum),
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.error
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                OutlinedButton(
                                    onClick = {
                                        activeReceipt?.id?.let { id ->
                                            viewModel.assignSpecificOutstanding(id)
                                        }
                                    },
                                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp),
                                    modifier = Modifier.height(32.dp)
                                ) {
                                    Text("Assign", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Floating bottom Settle All card bar
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(20.dp)
                .testTag("floating_summary_bar")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "TOTAL RECEIPT SUM",
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = String.format("$%.2f", totalAmount),
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }

                Button(
                    onClick = {
                        activeReceipt?.id?.let { id ->
                            viewModel.settleSpecificReceipt(id)
                            viewModel.navigateTo(Screen.DASHBOARD)
                            Toast.makeText(context, "Settle complete! Balances updated.", Toast.LENGTH_SHORT).show()
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = MaterialTheme.colorScheme.primary),
                    modifier = Modifier.testTag("settle_all_summary_button")
                ) {
                    Text("Settle All", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun ParticipantSplitDetailCard(
    person: com.example.data.ParticipantEntity,
    assignedItems: List<ReceiptItemEntity>,
    sharedCostTotal: Double,
    activeReceiptItems: List<ReceiptItemEntity>,
    onRequestClick: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.secondaryContainer)
                    ) {
                        if (person.avatarUrl.isNotEmpty()) {
                            AsyncImage(
                                model = person.avatarUrl,
                                contentDescription = person.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Text(
                                text = person.name.take(2).uppercase(),
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                    }

                    Column {
                        Text(text = person.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Text(text = "${assignedItems.size} items assigned", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = String.format("$%.2f", sharedCostTotal),
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    if (person.name != "Me") {
                        Button(
                            onClick = {
                                onRequestClick()
                            },
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer,
                                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                            ),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("Request", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Expanded line-item breakdown list
            if (expanded || assignedItems.isNotEmpty()) {
                AnimatedVisibility(
                    visible = expanded,
                    enter = expandVertically() + fadeIn(),
                    exit = shrinkVertically() + fadeOut()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp)
                    ) {
                        Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), thickness = 0.5.dp)
                        Spacer(modifier = Modifier.height(10.dp))

                        assignedItems.forEach { item ->
                            val peopleSplitting = item.assignedTo.split(",")
                            val ratioString = if (peopleSplitting.size > 1) " (1/${peopleSplitting.size})" else ""
                            val itemCost = item.price / peopleSplitting.size.coerceAtLeast(1)

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = item.name + ratioString,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = String.format("$%.2f", itemCost),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}


// Bottom navigation bar wrapper
@Composable
fun SplitBottomNavBar(
    currentTab: NavTab,
    onTabSelected: (NavTab) -> Unit
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        modifier = Modifier
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .border(
                1.dp,
                MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.2f),
                RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
            )
            .windowInsetsPadding(WindowInsets.navigationBars)
    ) {
        NavigationBarItem(
            selected = currentTab == NavTab.ACTIVITY,
            onClick = { onTabSelected(NavTab.ACTIVITY) },
            icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Activity") },
            label = { Text("Activity") }
        )
        NavigationBarItem(
            selected = currentTab == NavTab.GROUPS,
            onClick = { onTabSelected(NavTab.GROUPS) },
            icon = { Icon(Icons.Default.Group, contentDescription = "Groups") },
            label = { Text("Groups") }
        )
        NavigationBarItem(
            selected = currentTab == NavTab.HISTORY,
            onClick = { onTabSelected(NavTab.HISTORY) },
            icon = { Icon(Icons.Default.History, contentDescription = "History") },
            label = { Text("History") }
        )
        NavigationBarItem(
            selected = currentTab == NavTab.PROFILE,
            onClick = { onTabSelected(NavTab.PROFILE) },
            icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
            label = { Text("Profile") }
        )
    }
}


// 5. SECONDARY ARCHITECTURE SIM / BLANK STATE PAGES
@Composable
fun DummyGroupsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.Group,
            contentDescription = null,
            modifier = Modifier.size(72.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Split Groups",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            "Manage shared split checking among defined households, roommates, or trip groups.",
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun DummyHistoryScreen(viewModel: SplitViewModel) {
    val state by viewModel.dashboardUiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Text(
            "Split History",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.statusBarsPadding()
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            "Review your historic completed split checks and records.",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            val settledOnly = state.activities.filter { it.isSettled }
            if (settledOnly.isEmpty()) {
                item {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 48.dp)
                    ) {
                        Icon(
                            Icons.Default.History,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "No settled history yet.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            } else {
                items(settledOnly) { item ->
                    ActivityItemRow(item = item, onClick = {
                        viewModel.viewReceiptSummary(item.id)
                    })
                }
            }
        }
    }
}

@Composable
fun DummyProfileScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        // Avatar circle
        Box(
            modifier = Modifier
                .size(96.dp)
                .clip(CircleShape)
                .border(2.dp, MaterialTheme.colorScheme.primary, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = "https://lh3.googleusercontent.com/aida-public/AB6AXuCwH1BJhWoNjBZ72QbDPPIPLG_EMeugL_BMqXtwwKMv-h95i_xEq2bQlWY_Py0wXce_BIFDpm8Omr71Z2YZLsMXDic90GMcqEh5KDLXb2xhSiUoN27qy-2DCrmvo07ordIkrjpPtoxAZPxsW2Zj1iuGNz61L7-jv6rQIXE5cvouULOR_g_OIGuuVq4fQe3QFvX2x3HH2BiGN7xPjo--mAKFVXnrCSLdN13QPDw4u-gs1YEJ_oK7SW2Xr7ggV3iBHgCwiq9FZ8JbCDgg",
                contentDescription = "Me",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            "Hamza Naciri",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Text(
            "naciri.nhamza@gmail.com",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Navigation button options list
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ProfileListItem(icon = Icons.Outlined.Settings, label = "Preferences")
            ProfileListItem(icon = Icons.Outlined.Notifications, label = "Push Notification Settings")
            ProfileListItem(icon = Icons.Outlined.Payment, label = "Payment Methods")
            ProfileListItem(icon = Icons.Outlined.Security, label = "Privacy & Security")
        }
    }
}

@Composable
fun ProfileListItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth().height(52.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.2f))
    ) {
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.LightGray)
        }
    }
}
