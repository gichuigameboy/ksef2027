import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/ai_tutoring.dart';
import '../../services/api_service.dart';

class TutorChatMessage {
  final bool isUser;
  final String text;
  final TutorResponseModel? aiResponse;
  final DateTime timestamp;

  TutorChatMessage({
    required this.isUser,
    required this.text,
    this.aiResponse,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class AITutorScreen extends StatefulWidget {
  final String topicId;
  final String topicTitle;
  final String? questionId;
  final String? initialPrompt;
  final String? initialMode;

  const AITutorScreen({
    Key? key,
    required this.topicId,
    required this.topicTitle,
    this.questionId,
    this.initialPrompt,
    this.initialMode,
  }) : super(key: key);

  @override
  State<AITutorScreen> createState() => _AITutorScreenState();
}

class _AITutorScreenState extends State<AITutorScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<TutorChatMessage> _messages = [];
  bool _isLoading = false;

  final List<Map<String, String>> _quickActions = [
    {"label": "📖 Explain this", "mode": "explain", "prompt": "Can you explain this concept clearly?"},
    {"label": "💡 Give me a hint", "mode": "hint", "prompt": "Give me a hint on how to approach this."},
    {"label": "🧩 Show an example", "mode": "example", "prompt": "Show me a concrete worked example."},
    {"label": "🔍 Step-by-step", "mode": "step_by_step", "prompt": "Break this down into step-by-step reasoning."},
    {"label": "🌱 Simplify", "mode": "simplify", "prompt": "Can you simplify this explanation?"},
    {"label": "❓ Check understanding", "mode": "check_understanding", "prompt": "Ask me a check question to test my understanding."},
    {"label": "⚡ Challenge me", "mode": "challenge", "prompt": "Give me a harder conceptual challenge."},
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialPrompt != null || widget.initialMode != null) {
      _sendRequest(
        prompt: widget.initialPrompt ?? "Can you explain this concept?",
        mode: widget.initialMode ?? "explain",
      );
    } else {
      // Welcome message from EduGuard AI
      _messages.add(
        TutorChatMessage(
          isUser: false,
          text: "Hello! I'm your EduGuard AI Tutor for **${widget.topicTitle}**.\n\n"
              "I tailor explanations to your mastery level and common mistakes. "
              "Choose an action below or ask any question to get started.",
        ),
      );
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendRequest({required String prompt, String mode = 'explain'}) async {
    if (prompt.trim().isEmpty || _isLoading) return;

    setState(() {
      _messages.add(TutorChatMessage(isUser: true, text: prompt));
      _isLoading = true;
    });
    _textController.clear();
    _scrollToBottom();

    try {
      final response = await ApiService.askAITutor(
        topicId: widget.topicId,
        mode: mode,
        userMessage: prompt,
        currentQuestionId: widget.questionId,
      );

      setState(() {
        _messages.add(
          TutorChatMessage(
            isUser: false,
            text: response.explanation,
            aiResponse: response,
          ),
        );
        _isLoading = false;
      });
    } catch (_) {
      setState(() {
        _messages.add(
          TutorChatMessage(
            isUser: false,
            text: "I'm having trouble connecting right now. Please review the standard textbook explanation and try again.",
          ),
        );
        _isLoading = false;
      });
    }

    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome, color: AppColors.primaryGreen, size: 18),
                const SizedBox(width: 6),
                Text("EduGuard AI Tutor", style: AppTypography.titleMedium.copyWith(fontSize: 16)),
              ],
            ),
            Text(
              widget.topicTitle,
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                fontSize: 12,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  "Context Grounded",
                  style: AppTypography.bodySmall.copyWith(fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Quick action pills
            Container(
              height: 48,
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _quickActions.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final action = _quickActions[idx];
                  return ActionChip(
                    label: Text(
                      action["label"]!,
                      style: AppTypography.bodySmall.copyWith(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                    backgroundColor: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
                    side: BorderSide(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                    onPressed: () => _sendRequest(
                      prompt: action["prompt"]!,
                      mode: action["mode"]!,
                    ),
                  );
                },
              ),
            ),
            const Divider(height: 1),

            // Messages thread
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  return _buildMessageBubble(msg, isDark);
                },
              ),
            ),

            if (_isLoading)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                alignment: Alignment.centerLeft,
                child: Row(
                  children: [
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGreen),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      "EduGuard AI is thinking...",
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),

            // Bottom Input Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: InputDecoration(
                        hintText: "Ask anything about ${widget.topicTitle}...",
                        hintStyle: AppTypography.bodySmall.copyWith(
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        filled: true,
                        fillColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (val) => _sendRequest(prompt: val),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.arrow_upward_rounded),
                    color: Colors.white,
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      shape: const CircleBorder(),
                    ),
                    onPressed: () => _sendRequest(prompt: _textController.text),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(TutorChatMessage msg, bool isDark) {
    if (msg.isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12, left: 48),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.primaryGreen,
            borderRadius: BorderRadius.circular(16).copyWith(bottomRight: const Radius.circular(2)),
          ),
          child: Text(
            msg.text,
            style: AppTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w500),
          ),
        ),
      );
    }

    final ai = msg.aiResponse;

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16, right: 32),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(16).copyWith(bottomLeft: const Radius.circular(2)),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome, size: 16, color: AppColors.primaryGreen),
                const SizedBox(width: 6),
                Text(
                  "EduGuard AI",
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryGreen,
                  ),
                ),
                if (ai != null) ...[
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightBorderSubtle,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      ai.mode.toUpperCase(),
                      style: AppTypography.bodySmall.copyWith(fontSize: 9, fontWeight: FontWeight.w700),
                    ),
                  )
                ]
              ],
            ),
            const SizedBox(height: 10),
            Text(
              msg.text,
              style: AppTypography.bodyMedium.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                height: 1.45,
              ),
            ),
            if (ai != null) ...[
              if (ai.keyConcept.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightBorderSubtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.vpn_key_rounded, size: 14, color: AppColors.accentTeal),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          ai.keyConcept,
                          style: AppTypography.bodySmall.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (ai.steps.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text("Step-by-Step Breakdown:", style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                ...ai.steps.map((step) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("• ", style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
                      Expanded(child: Text(step, style: AppTypography.bodySmall)),
                    ],
                  ),
                )),
              ],
              if (ai.example != null && ai.example!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Worked Example:", style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.primaryGreen)),
                      const SizedBox(height: 4),
                      Text(ai.example!, style: AppTypography.bodySmall),
                    ],
                  ),
                ),
              ],
              if (ai.checkQuestion != null && ai.checkQuestion!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text("Check Your Understanding:", style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.accentTeal)),
                const SizedBox(height: 4),
                Text(ai.checkQuestion!, style: AppTypography.bodySmall.copyWith(fontStyle: FontStyle.italic)),
              ],
              if (ai.encouragement.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  ai.encouragement,
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ]
          ],
        ),
      ),
    );
  }
}
