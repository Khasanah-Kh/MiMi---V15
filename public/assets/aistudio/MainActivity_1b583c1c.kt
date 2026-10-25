package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.lifecycle.viewmodel.initializer
import com.example.data.AuthRepository
import com.example.data.AuthResult
import com.example.data.UserRepository
import com.example.data.local.MimiLocalDatabase
import com.example.data.local.StudyProgressLocalRepository
import com.example.model.BottomNavTab
import com.example.ui.components.CyberBottomBar
import com.example.ui.components.CyberNavigationRail
import com.example.ui.components.MimiDesktopFloatingChatWindow
import com.example.ui.components.MimiFloatingDockWidget
import com.example.ui.components.ShareAndDownloadHubDialog
import com.example.ui.components.WebTopBar
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.KuisScreen
import com.example.ui.screens.LencanaScreen
import com.example.ui.screens.MimiChatBottomSheet
import com.example.ui.screens.ProfilScreen
import com.example.ui.screens.SignInScreen
import com.example.ui.screens.TantanganScreen
import com.example.ui.theme.DarkNavyBg
import com.example.ui.theme.MyApplicationTheme
import com.example.util.configureAppCheck
import com.example.viewmodel.MimiViewModel
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // Configure App Check with launch intent before any UI, ViewModels, or Firebase calls
    configureAppCheck(this, intent)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        RootAppNavigation()
      }
    }
  }
}

@Composable
fun RootAppNavigation() {
  val context = LocalContext.current
  val authRepository = remember { AuthRepository(context) }
  val currentUser by authRepository.authState.collectAsStateWithLifecycle(initialValue = authRepository.currentUser)
  val coroutineScope = rememberCoroutineScope()

  var isSigningIn by remember { mutableStateOf(false) }
  var signInErrorMessage by remember { mutableStateOf<String?>(null) }

  androidx.compose.runtime.LaunchedEffect(Unit) {
    if (authRepository.currentUser == null) {
      authRepository.attemptAutoSignIn()
    }
  }

  val user = currentUser
  if (user == null) {
    // Unauthenticated: Render Sign-In Gate only with Google Sign-In
    SignInScreen(
      isLoading = isSigningIn,
      errorMessage = signInErrorMessage,
      onSignInClick = {
        isSigningIn = true
        signInErrorMessage = null
        coroutineScope.launch {
          when (val result = authRepository.signInWithGoogle()) {
            is AuthResult.Success -> {
              isSigningIn = false
            }
            is AuthResult.Cancelled -> {
              isSigningIn = false
            }
            is AuthResult.Error -> {
              isSigningIn = false
              signInErrorMessage = result.message
            }
          }
        }
      }
    )
  } else {
    // Authenticated: Pass custom database ID to Firestore and initialize MimiViewModel
    val viewModel: MimiViewModel = viewModel(
      key = user.uid,
      factory = viewModelFactory {
        initializer {
          val databaseId = context.getString(R.string.firestore_database_id)
          val db = FirebaseFirestore.getInstance(databaseId)
          val userRepository = UserRepository(db)
          val roomDb = MimiLocalDatabase.getInstance(context)
          val localRepo = StudyProgressLocalRepository(roomDb.studyProgressDao())
          MimiViewModel(
            userRepository = userRepository,
            studyProgressLocalRepository = localRepo,
            currentUserId = user.uid,
            initialName = user.displayName?.ifBlank { "Siswa Cyber" } ?: "Siswa Cyber",
            initialEmail = user.email
          )
        }
      }
    )

    MimiApp(
      viewModel = viewModel,
      onSignOut = {
        coroutineScope.launch {
          authRepository.signOut()
        }
      }
    )
  }
}

@Composable
fun MimiApp(
  viewModel: MimiViewModel = viewModel(),
  onSignOut: () -> Unit = {}
) {
  val uiState by viewModel.uiState.collectAsStateWithLifecycle()
  val localStudyProgress by viewModel.localStudyProgress.collectAsStateWithLifecycle()
  val learningMilestones by viewModel.learningMilestones.collectAsStateWithLifecycle()
  var isShareHubOpen by remember { mutableStateOf(false) }
  var isChatDocked by remember { mutableStateOf(false) }

  // BackHandler to handle dismissing chat or returning to Home tab
  BackHandler(enabled = uiState.isChatOpen || uiState.currentTab != BottomNavTab.BERANDA) {
    if (uiState.isChatOpen) {
      viewModel.closeChat()
    } else if (uiState.currentTab != BottomNavTab.BERANDA) {
      viewModel.setTab(BottomNavTab.BERANDA)
    }
  }

  // Share & Download Hub Dialog (accessible from both Mobile & Web PC)
  if (isShareHubOpen) {
    ShareAndDownloadHubDialog(
      uiState = uiState,
      onDismiss = { isShareHubOpen = false }
    )
  }

  BoxWithConstraints(
    modifier = Modifier
      .fillMaxSize()
      .background(DarkNavyBg)
  ) {
    val isWideScreen = maxWidth >= 768.dp

    if (isWideScreen) {
      // ══════════════════════════════════════════════════════════════════
      // DESKTOP PC WEB LAYOUT (Wide browser viewport)
      // ══════════════════════════════════════════════════════════════════
      Row(
        modifier = Modifier
          .fillMaxSize()
          .background(DarkNavyBg)
      ) {
        // 1. Desktop Left Navigation Rail
        CyberNavigationRail(
          currentTab = uiState.currentTab,
          onTabSelected = { tab -> viewModel.setTab(tab) },
          uiState = uiState,
          isChatOpen = uiState.isChatOpen,
          onToggleChat = {
            if (uiState.isChatOpen) viewModel.closeChat() else viewModel.openChat()
          },
          onOpenShareHub = { isShareHubOpen = true }
        )

        // 2. Main Content Canvas + Top Web Bar
        Box(
          modifier = Modifier
            .weight(1f)
            .fillMaxHeight()
            .background(DarkNavyBg)
        ) {
          Column(modifier = Modifier.fillMaxSize()) {
            // Web Header
            WebTopBar(
              uiState = uiState,
              isChatOpen = uiState.isChatOpen,
              isChatDocked = isChatDocked,
              onToggleChat = {
                if (uiState.isChatOpen) viewModel.closeChat() else viewModel.openChat()
              },
              onToggleDock = { isChatDocked = !isChatDocked },
              onOpenShareHub = { isShareHubOpen = true }
            )

            // Centered Screen Content
            Box(
              modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp),
              contentAlignment = Alignment.TopCenter
            ) {
              Box(
                modifier = Modifier
                  .widthIn(max = if (uiState.isChatOpen && isChatDocked) 680.dp else 840.dp)
                  .fillMaxSize()
              ) {
                when (uiState.currentTab) {
                  BottomNavTab.BERANDA -> {
                    HomeScreen(
                      uiState = uiState,
                      levels = uiState.currentLevels,
                      studyProgress = localStudyProgress,
                      milestones = learningMilestones,
                      onSelectEducationLevel = { level -> viewModel.setEducationLevel(level) },
                      onSelectClass = { cls -> viewModel.setSelectedClass(cls) },
                      onLevelClick = { levelItem -> viewModel.selectLevelItem(levelItem) },
                      onAddMilestone = { title, xp -> viewModel.recordCustomLearningMilestone(title = title, xpGain = xp) },
                      onDeleteMilestone = { id -> viewModel.deleteLearningMilestone(id) }
                    )
                  }
                  BottomNavTab.TANTANGAN -> {
                    TantanganScreen(
                      uiState = uiState,
                      onChallengeRival = { viewModel.challengeRival() }
                    )
                  }
                  BottomNavTab.KUIS -> {
                    KuisScreen(
                      uiState = uiState,
                      onAnswerSelected = { optionIndex -> viewModel.answerQuiz(optionIndex) },
                      onRestartQuiz = { viewModel.restartQuiz() }
                    )
                  }
                  BottomNavTab.LENCANA -> {
                    LencanaScreen(
                      badges = uiState.badges
                    )
                  }
                  BottomNavTab.PROFIL -> {
                    ProfilScreen(
                      uiState = uiState,
                      studyProgress = localStudyProgress,
                      milestones = learningMilestones,
                      onAddMilestone = { title, xp -> viewModel.recordCustomLearningMilestone(title = title, xpGain = xp) },
                      onDeleteMilestone = { id -> viewModel.deleteLearningMilestone(id) },
                      onSignOut = onSignOut
                    )
                  }
                }
              }
            }
          }

          // Floating Tutor Trigger on PC when closed
          MimiFloatingDockWidget(
            isOpen = uiState.isChatOpen,
            isWideScreen = true,
            onClick = { viewModel.openChat() },
            modifier = Modifier.align(Alignment.BottomEnd)
          )

          // Floating Desktop Chat Window (when not docked)
          if (uiState.isChatOpen && !isChatDocked) {
            MimiDesktopFloatingChatWindow(
              isOpen = true,
              isDocked = false,
              onDismiss = { viewModel.closeChat() },
              onToggleDock = { isChatDocked = true },
              messages = uiState.chatMessages,
              isTyping = uiState.isMimiTyping,
              suggestedPrompts = viewModel.getSuggestedPrompts(),
              selectedLevel = uiState.selectedEducationLevel,
              selectedClass = uiState.selectedClass,
              onSelectLevel = { level -> viewModel.setEducationLevel(level) },
              onSelectClass = { cls -> viewModel.setSelectedClass(cls) },
              onSendMessage = { text -> viewModel.sendMessage(text) },
              latestXpNotification = uiState.latestXpNotification,
              modifier = Modifier.align(Alignment.BottomEnd)
            )
          }
        }

        // 3. Docked Right Side-Pane Chat (when isChatDocked == true)
        if (uiState.isChatOpen && isChatDocked) {
          MimiDesktopFloatingChatWindow(
            isOpen = true,
            isDocked = true,
            onDismiss = { viewModel.closeChat() },
            onToggleDock = { isChatDocked = false },
            messages = uiState.chatMessages,
            isTyping = uiState.isMimiTyping,
            suggestedPrompts = viewModel.getSuggestedPrompts(),
            selectedLevel = uiState.selectedEducationLevel,
            selectedClass = uiState.selectedClass,
            onSelectLevel = { level -> viewModel.setEducationLevel(level) },
            onSelectClass = { cls -> viewModel.setSelectedClass(cls) },
            onSendMessage = { text -> viewModel.sendMessage(text) },
            latestXpNotification = uiState.latestXpNotification
          )
        }
      }
    } else {
      // ══════════════════════════════════════════════════════════════════
      // MOBILE SMARTPHONE LAYOUT (Compact portrait)
      // ══════════════════════════════════════════════════════════════════
      Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = DarkNavyBg,
        bottomBar = {
          CyberBottomBar(
            currentTab = uiState.currentTab,
            onTabSelected = { tab ->
              viewModel.setTab(tab)
            }
          )
        }
      ) { innerPadding ->
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(DarkNavyBg)
            .statusBarsPadding()
            .padding(bottom = innerPadding.calculateBottomPadding())
        ) {
          when (uiState.currentTab) {
            BottomNavTab.BERANDA -> {
              HomeScreen(
                uiState = uiState,
                levels = uiState.currentLevels,
                studyProgress = localStudyProgress,
                milestones = learningMilestones,
                onSelectEducationLevel = { level -> viewModel.setEducationLevel(level) },
                onSelectClass = { cls -> viewModel.setSelectedClass(cls) },
                onLevelClick = { levelItem -> viewModel.selectLevelItem(levelItem) },
                onAddMilestone = { title, xp -> viewModel.recordCustomLearningMilestone(title = title, xpGain = xp) },
                onDeleteMilestone = { id -> viewModel.deleteLearningMilestone(id) }
              )
            }
            BottomNavTab.TANTANGAN -> {
              TantanganScreen(
                uiState = uiState,
                onChallengeRival = { viewModel.challengeRival() }
              )
            }
            BottomNavTab.KUIS -> {
              KuisScreen(
                uiState = uiState,
                onAnswerSelected = { optionIndex -> viewModel.answerQuiz(optionIndex) },
                onRestartQuiz = { viewModel.restartQuiz() }
              )
            }
            BottomNavTab.LENCANA -> {
              LencanaScreen(
                badges = uiState.badges
              )
            }
            BottomNavTab.PROFIL -> {
              ProfilScreen(
                uiState = uiState,
                studyProgress = localStudyProgress,
                milestones = learningMilestones,
                onAddMilestone = { title, xp -> viewModel.recordCustomLearningMilestone(title = title, xpGain = xp) },
                onDeleteMilestone = { id -> viewModel.deleteLearningMilestone(id) },
                onSignOut = onSignOut
              )
            }
          }

          // Floating Mascot FAB for Mobile
          MimiFloatingDockWidget(
            isOpen = uiState.isChatOpen,
            isWideScreen = false,
            onClick = { viewModel.openChat() },
            modifier = Modifier.align(Alignment.BottomEnd)
          )
        }

        // Mobile Bottom Sheet
        MimiChatBottomSheet(
          isOpen = uiState.isChatOpen,
          onDismiss = { viewModel.closeChat() },
          messages = uiState.chatMessages,
          isTyping = uiState.isMimiTyping,
          suggestedPrompts = viewModel.getSuggestedPrompts(),
          selectedLevel = uiState.selectedEducationLevel,
          selectedClass = uiState.selectedClass,
          onSelectLevel = { level -> viewModel.setEducationLevel(level) },
          onSelectClass = { cls -> viewModel.setSelectedClass(cls) },
          onSendMessage = { text -> viewModel.sendMessage(text) },
          latestXpNotification = uiState.latestXpNotification
        )
      }
    }
  }
}

