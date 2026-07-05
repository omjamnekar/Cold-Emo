import 'package:flutter/material.dart';
import 'package:portal_client/common/enums/project_status.dart';
import 'package:portal_client/common/models/project.dart';
import 'package:portal_client/common/utils/format_time.dart';
import 'package:portal_client/features/home/presentation/widgets/section_status_badge.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({
    super.key,
    required this.projects,
    required this.onCreateProject,
    required this.onOpenProject,
    required this.onDeleteProject,
  });

  final List<Project> projects;
  final VoidCallback onCreateProject;
  final ValueChanged<Project> onOpenProject;
  final ValueChanged<Project> onDeleteProject;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Projects',
                      style: Theme.of(context).textTheme.headlineLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Manage target companies, launch searches, and review outreach progress.',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              ),
              FilledButton.icon(
                onPressed: onCreateProject,
                icon: const Icon(Icons.add),
                label: const Text('New Project'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: projects.isEmpty
                ? _NoProjects(onCreateProject: onCreateProject)
                : _ProjectList(
                    projects: projects,
                    onOpenProject: onOpenProject,
                    onDeleteProject: onDeleteProject,
                  ),
          ),
        ],
      ),
    );
  }
}

class _NoProjects extends StatelessWidget {
  const _NoProjects({super.key, required this.onCreateProject});

  final VoidCallback onCreateProject;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.folder_open, size: 48, color: Colors.grey),
              const SizedBox(height: 20),
              Text(
                'No projects yet',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              Text(
                'Create a project to begin organizing outreach for a target company.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: onCreateProject,
                child: const Text('Create your first project'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProjectList extends StatelessWidget {
  const _ProjectList({
    super.key,
    required this.projects,
    required this.onOpenProject,
    required this.onDeleteProject,
  });

  final List<Project> projects;
  final ValueChanged<Project> onOpenProject;
  final ValueChanged<Project> onDeleteProject;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      itemCount: projects.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final project = projects[index];
        return Card(
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        project.companyName,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ),
                    SectionStatusBadge(status: project.status),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  project.notes.isEmpty ? 'No notes yet.' : project.notes,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(color: Colors.grey.shade700),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    _SummaryBadge(
                      value: '${project.employeeCount}',
                      label: 'Employees',
                    ),
                    const SizedBox(width: 12),
                    _SummaryBadge(
                      value: formatRelativeTime(project.lastUpdated),
                      label: 'Updated',
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: LinearProgressIndicator(
                        value: project.searchProgress,
                        minHeight: 8,
                        color: Theme.of(context).colorScheme.primary,
                        backgroundColor: Theme.of(
                          context,
                        ).colorScheme.primary.withOpacity(0.16),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    FilledButton(
                      onPressed: () => onOpenProject(project),
                      child: const Text('Open project'),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton(
                      onPressed: () => onDeleteProject(project),
                      child: const Text('Delete'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _SummaryBadge extends StatelessWidget {
  const _SummaryBadge({super.key, required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}
