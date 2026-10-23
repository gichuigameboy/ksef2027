import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/ai_tutoring.dart';
import '../../services/api_service.dart';

class NotesAnalyzerScreen extends StatefulWidget {
  final String? initialTopicId;
  final String? initialSubjectId;

  const NotesAnalyzerScreen({
    Key? key,
    this.initialTopicId,
    this.initialSubjectId,
  }) : super(key: key);

  @override
  State<NotesAnalyzerScreen> createState() => _NotesAnalyzerScreenState();
}

class _NotesAnalyzerScreenState extends State<NotesAnalyzerScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _notesController = TextEditingController();
  bool _isLoading = false;
  NotesAnalysisResponseModel? _result;
  late TabController _tabController;
  int _activeFlashcardIndex = 0;
  bool _showFlashcardBack = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _notesController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _analyzeNotes() async {
    final text = _notesController.text.trim();
    if (text.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter at least 10 characters of study notes.")),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final res = await ApiService.analyzeNotesWithAI(
        notesText: text,
        topicId: widget.initialTopicId,
        subjectId: widget.initialSubjectId,
      );
      setState(() {
        _result = res;
        _isLoading = false;
        _activeFlashcardIndex = 0;
        _showFlashcardBack = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Could not analyze notes. Please try again.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text("AI Study Notes Analyzer", style: AppTypography.titleMedium),
        actions: [
          if (_result != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: "Analyze new notes",
              onPressed: () => setState(() => _result = null),
            ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 780),
          child: _result == null ? _buildInputView(isDark) : _buildResultsView(isDark),
        ),
      ),
    );
  }

  Widget _buildInputView(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.auto_awesome, color: AppColors.primaryGreen, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Transform Your Notes into Study Tools", style: AppTypography.titleMedium.copyWith(fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(
                      "Paste your handwritten lecture transcripts, textbook passages, or revision bullet points. "
                      "EduGuard AI will extract core concepts, synthesize active-recall flashcards, and suggest prerequisite concepts.",
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Text("Paste Study Notes or Text", style: AppTypography.titleMedium.copyWith(fontSize: 14)),
        const SizedBox(height: 8),
        TextField(
          controller: _notesController,
          maxLines: 12,
          decoration: InputDecoration(
            hintText: "Paste lecture notes, definitions, or textbook paragraphs here...",
            hintStyle: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
            filled: true,
            fillColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: 48,
          child: ElevatedButton.icon(
            icon: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.psychology_rounded),
            label: Text(_isLoading ? "Analyzing Notes..." : "Analyze with EduGuard AI"),
            onPressed: _isLoading ? null : _analyzeNotes,
          ),
        ),
      ],
    );
  }

  Widget _buildResultsView(bool isDark) {
    final res = _result!;

    return Column(
      children: [
        // Tab Bar
        TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryGreen,
          unselectedLabelColor: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          indicatorColor: AppColors.primaryGreen,
          tabs: const [
            Tab(text: "Summary"),
            Tab(text: "Flashcards"),
            Tab(text: "Key Concepts"),
            Tab(text: "Prerequisites"),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              // 1. Summary Tab
              ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _buildDisclaimerBadge(res.disclaimer, isDark),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.summarize_rounded, color: AppColors.primaryGreen, size: 20),
                              const SizedBox(width: 8),
                              Text("Synthesis & Executive Summary", style: AppTypography.titleMedium),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(res.summary, style: AppTypography.bodyMedium.copyWith(height: 1.5)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // 2. Flashcards Tab
              res.flashcards.isEmpty
                  ? Center(child: Text("No flashcards generated.", style: AppTypography.bodyMedium))
                  : Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Card ${_activeFlashcardIndex + 1} of ${res.flashcards.length}",
                            style: AppTypography.bodySmall,
                          ),
                          const SizedBox(height: 12),
                          InkWell(
                            onTap: () => setState(() => _showFlashcardBack = !_showFlashcardBack),
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              height: 220,
                              width: double.infinity,
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: _showFlashcardBack ? AppColors.primaryGreen : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                                  width: 1.5,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    _showFlashcardBack ? "ANSWER" : "QUESTION / PROMPT",
                                    style: AppTypography.bodySmall.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: _showFlashcardBack ? AppColors.primaryGreen : AppColors.accentTeal,
                                      fontSize: 11,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    _showFlashcardBack
                                        ? res.flashcards[_activeFlashcardIndex].back
                                        : res.flashcards[_activeFlashcardIndex].front,
                                    textAlign: TextAlign.center,
                                    style: AppTypography.titleMedium.copyWith(fontSize: 17),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    "Tap to flip",
                                    style: AppTypography.bodySmall.copyWith(
                                      color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.arrow_back_rounded),
                                onPressed: _activeFlashcardIndex > 0
                                    ? () => setState(() {
                                          _activeFlashcardIndex--;
                                          _showFlashcardBack = false;
                                        })
                                    : null,
                              ),
                              const SizedBox(width: 24),
                              IconButton(
                                icon: const Icon(Icons.arrow_forward_rounded),
                                onPressed: _activeFlashcardIndex < res.flashcards.length - 1
                                    ? () => setState(() {
                                          _activeFlashcardIndex++;
                                          _showFlashcardBack = false;
                                        })
                                    : null,
                              ),
                            ],
                          )
                        ],
                      ),
                    ),

              // 3. Key Concepts Tab
              ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  ...res.keyConcepts.map((kc) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(kc.name, style: AppTypography.titleMedium.copyWith(fontSize: 15, color: AppColors.primaryGreen)),
                              const SizedBox(height: 6),
                              Text(kc.definition, style: AppTypography.bodyMedium),
                              if (kc.importance.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  "Why it matters: ${kc.importance}",
                                  style: AppTypography.bodySmall.copyWith(
                                    fontStyle: FontStyle.italic,
                                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      )),
                ],
              ),

              // 4. Prerequisites Tab
              ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text("Recommended Foundations", style: AppTypography.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    "Mastering these prerequisite concepts will make understanding these notes significantly easier:",
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...res.suggestedPrerequisites.map((prereq) => ListTile(
                        leading: const Icon(Icons.check_circle_outline_rounded, color: AppColors.primaryGreen),
                        title: Text(prereq, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                      )),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDisclaimerBadge(String disclaimer, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, size: 14, color: AppColors.accentTeal),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              disclaimer,
              style: AppTypography.bodySmall.copyWith(fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}
