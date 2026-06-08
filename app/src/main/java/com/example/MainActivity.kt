package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.data.AppDatabase
import com.example.data.SplitRepository
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.SplitApp
import com.example.ui.SplitViewModel
import com.example.ui.SplitViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Instantiate local persistent SQLite with Room Database
        val database = AppDatabase.getDatabase(this)
        val repository = SplitRepository(database.splitDao())

        // ViewModel initialization via custom factory provider
        val viewModel: SplitViewModel by viewModels {
            SplitViewModelFactory(application, repository)
        }

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SplitApp(viewModel = viewModel)
                }
            }
        }
    }
}

// Compatibility bridge for screenshot unit test structures
@androidx.compose.runtime.Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    androidx.compose.material3.Text(text = "Hello $name!", modifier = modifier)
}
