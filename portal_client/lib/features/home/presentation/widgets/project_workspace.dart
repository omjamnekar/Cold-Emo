import 'package:flutter/material.dart';
import 'package:portal_client/common/enums/contact_status.dart';
import 'package:portal_client/common/enums/project_status.dart';
import 'package:portal_client/common/enums/sort_option.dart';
import 'package:portal_client/common/models/employee.dart';
import 'package:portal_client/common/models/project.dart';
import 'package:portal_client/common/extensions/contact_status_label_ext.dart';
import 'package:portal_client/common/extensions/sort_option_label_ext.dart';
import 'package:portal_client/common/utils/format_time.dart';
import 'package:portal_client/features/home/presentation/widgets/section_status_badge.dart';

class ProjectWorkspace extends StatelessWidget {
  const ProjectWorkspace({
    super.key,
    required this.activeProject,
    required this.searchRunning,
    required this.searchStatus,
    required this.searchProgress,
    required this.selectedEmployee,
    required this.searchQuery,
    required this.filterStatus,
    required this.sortOption,
    required this.emailSubjectController,
    required this.emailBodyController,
    required this.onSearchQueryChanged,
    required this.onFilterStatusChanged,
    required this.onSortOptionChanged,
    required this.onSelectEmployee,
    required this.onStartSearch,
    required this.onRefreshSearch,
    required this.onOpenSettings,
    required this.onGenerateEmail,
    required this.onSendEmail,
    required this.onSaveDraft,
    required this.onCopyEmail,
    required this.emailGenerating,
    required this.emailSending,
  });

  final Project activeProject;
  final bool searchRunning;
  final String searchStatus;
  final double searchProgress;
  final Employee? selectedEmployee;
  final String searchQuery;
  final ContactStatus? filterStatus;
  final SortOption sortOption;
  final TextEditingController? emailSubjectController;
  final TextEditingController? emailBodyController;
  final ValueChanged<String> onSearchQueryChanged;
  final ValueChanged<ContactStatus?> onFilterStatusChanged;
  final ValueChanged<SortOption?> onSortOptionChanged;
  final ValueChanged<Employee> onSelectEmployee;
  final VoidCallback onStartSearch;
  final VoidCallback onRefreshSearch;
  final VoidCallback onOpenSettings;
  final VoidCallback onGenerateEmail;
  final VoidCallback onSendEmail;
  final VoidCallback onSaveDraft;
  final VoidCallback onCopyEmail;
  final bool emailGenerating;
  final bool emailSending;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ProjectHeader(
            activeProject: activeProject,
            searchRunning: searchRunning,
            searchStatus: searchStatus,
            searchProgress: searchProgress,
            onStartSearch: onStartSearch,
            onRefreshSearch: onRefreshSearch,
            onOpenSettings: onOpenSettings,
          ),
          const SizedBox(height: 24),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: 2,
                  child: _EmployeePanel(
                    employees: activeProject.employees,
                    selectedEmployee: selectedEmployee,
                    searchQuery: searchQuery,
                    filterStatus: filterStatus,
                    sortOption: sortOption,
                    onSearchQueryChanged: onSearchQueryChanged,
                    onFilterStatusChanged: onFilterStatusChanged,
                    onSortOptionChanged: onSortOptionChanged,
                    onSelectEmployee: onSelectEmployee,
                    onStartSearch: onStartSearch,
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  flex: 3,
                  child: _DetailsPanel(
                    employee: selectedEmployee,
                    emailSubjectController: emailSubjectController,
                    emailBodyController: emailBodyController,
                    onGenerateEmail: onGenerateEmail,
                    onSendEmail: onSendEmail,
                    onSaveDraft: onSaveDraft,
                    onCopyEmail: onCopyEmail,
                    emailGenerating: emailGenerating,
                    emailSending: emailSending,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProjectHeader extends StatelessWidget {
  const _ProjectHeader({
    required this.activeProject,
    required this.searchRunning,
    required this.searchStatus,
    required this.searchProgress,
    required this.onStartSearch,
    required this.onRefreshSearch,
    required this.onOpenSettings,
  });

  final Project activeProject;
  final bool searchRunning;
  final String searchStatus;
  final double searchProgress;
  final VoidCallback onStartSearch;
  final VoidCallback onRefreshSearch;
  final VoidCallback onOpenSettings;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activeProject.companyName,
                        style: Theme.of(context).textTheme.headlineLarge,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          SectionStatusBadge(status: activeProject.status),
                          const SizedBox(width: 8),
                          Text(
                            '${activeProject.employeeCount} employees',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                FilledButton.icon(
                  onPressed: searchRunning ? null : onStartSearch,
                  icon: const Icon(Icons.search),
                  label: Text(
                    activeProject.status == ProjectStatus.searching
                        ? 'Searching'
                        : 'Start search',
                  ),
                ),
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  onPressed: searchRunning ? null : onRefreshSearch,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                ),
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  onPressed: onOpenSettings,
                  icon: const Icon(Icons.settings),
                  label: const Text('Settings'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (searchRunning) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    searchStatus,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  Text(
                    '${(searchProgress * 100).clamp(0, 100).toStringAsFixed(0)}%',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              LinearProgressIndicator(value: searchProgress),
            ] else ...[
              Wrap(
                spacing: 16,
                runSpacing: 12,
                children: [
                  _StatusBadge(
                    label: 'Last updated',
                    value: formatRelativeTime(activeProject.lastUpdated),
                  ),
                  _StatusBadge(
                    label: 'Search status',
                    value: activeProject.status.name.capitalized,
                  ),
                  _StatusBadge(
                    label: 'Last search',
                    value: activeProject.employeeCount > 0
                        ? formatRelativeTime(activeProject.lastUpdated)
                        : 'None',
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _EmployeePanel extends StatelessWidget {
  const _EmployeePanel({
    required this.employees,
    required this.selectedEmployee,
    required this.searchQuery,
    required this.filterStatus,
    required this.sortOption,
    required this.onSearchQueryChanged,
    required this.onFilterStatusChanged,
    required this.onSortOptionChanged,
    required this.onSelectEmployee,
    required this.onStartSearch,
  });

  final List<Employee> employees;
  final Employee? selectedEmployee;
  final String searchQuery;
  final ContactStatus? filterStatus;
  final SortOption sortOption;
  final ValueChanged<String> onSearchQueryChanged;
  final ValueChanged<ContactStatus?> onFilterStatusChanged;
  final ValueChanged<SortOption?> onSortOptionChanged;
  final ValueChanged<Employee> onSelectEmployee;
  final VoidCallback onStartSearch;

  List<Employee> get filteredEmployees {
    final query = searchQuery.trim().toLowerCase();
    final filtered = employees.where((employee) {
      final match =
          employee.name.toLowerCase().contains(query) ||
          employee.title.toLowerCase().contains(query) ||
          employee.department.toLowerCase().contains(query);
      final statusMatch =
          filterStatus == null || employee.contactStatus == filterStatus;
      return match && statusMatch;
    }).toList();

    filtered.sort((a, b) {
      switch (sortOption) {
        case SortOption.name:
          return a.name.compareTo(b.name);
        case SortOption.status:
          return a.contactStatus.index.compareTo(b.contactStatus.index);
        case SortOption.location:
          return a.location.compareTo(b.location);
      }
    });

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Employees', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                hintText: 'Search by name, title or department',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: onSearchQueryChanged,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _StatusFilterChip(
                  status: ContactStatus.newLead,
                  selectedStatus: filterStatus,
                  onSelected: onFilterStatusChanged,
                ),
                _StatusFilterChip(
                  status: ContactStatus.emailGenerated,
                  selectedStatus: filterStatus,
                  onSelected: onFilterStatusChanged,
                ),
                _StatusFilterChip(
                  status: ContactStatus.contacted,
                  selectedStatus: filterStatus,
                  onSelected: onFilterStatusChanged,
                ),
                ActionChip(
                  label: const Text('Clear filter'),
                  onPressed: () => onFilterStatusChanged(null),
                ),
                const SizedBox(width: 12),
                DropdownButton<SortOption>(
                  value: sortOption,
                  items: SortOption.values
                      .map(
                        (option) => DropdownMenuItem(
                          value: option,
                          child: Text(option.label),
                        ),
                      )
                      .toList(),
                  onChanged: onSortOptionChanged,
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: employees.isEmpty
                  ? _NoEmployees(onStartSearch: onStartSearch)
                  : _buildEmployeeList(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmployeeList(BuildContext context) {
    final list = filteredEmployees;
    if (list.isEmpty) {
      return Center(
        child: Text(
          'No matching employees',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      );
    }

    return ListView.separated(
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final employee = list[index];
        final selected = selectedEmployee?.id == employee.id;

        return MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => onSelectEmployee(employee),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: selected
                    ? Theme.of(context).colorScheme.primary.withOpacity(0.08)
                    : Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: selected
                      ? Theme.of(context).colorScheme.primary
                      : Colors.transparent,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          employee.name,
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          employee.title,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      employee.department,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      employee.location,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  Chip(label: Text(employee.contactStatus.label)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _StatusFilterChip extends StatelessWidget {
  const _StatusFilterChip({
    required this.status,
    required this.selectedStatus,
    required this.onSelected,
  });

  final ContactStatus status;
  final ContactStatus? selectedStatus;
  final ValueChanged<ContactStatus?> onSelected;

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(status.label),
      selected: selectedStatus == status,
      onSelected: (_) => onSelected(selectedStatus == status ? null : status),
    );
  }
}

class _NoEmployees extends StatelessWidget {
  const _NoEmployees({super.key, required this.onStartSearch});

  final VoidCallback onStartSearch;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.people_outline, size: 52, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            'No employees yet',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Start a search to populate this workspace with profiles.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 18),
          FilledButton(
            onPressed: onStartSearch,
            child: const Text('Start search'),
          ),
        ],
      ),
    );
  }
}

class _DetailsPanel extends StatelessWidget {
  const _DetailsPanel({
    required this.employee,
    required this.emailSubjectController,
    required this.emailBodyController,
    required this.onGenerateEmail,
    required this.onSendEmail,
    required this.onSaveDraft,
    required this.onCopyEmail,
    required this.emailGenerating,
    required this.emailSending,
  });

  final Employee? employee;
  final TextEditingController? emailSubjectController;
  final TextEditingController? emailBodyController;
  final VoidCallback onGenerateEmail;
  final VoidCallback onSendEmail;
  final VoidCallback onSaveDraft;
  final VoidCallback onCopyEmail;
  final bool emailGenerating;
  final bool emailSending;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: employee == null
            ? _NoSelection()
            : _DetailContent(
                employee: employee!,
                emailSubjectController: emailSubjectController,
                emailBodyController: emailBodyController,
                onGenerateEmail: onGenerateEmail,
                onSendEmail: onSendEmail,
                onSaveDraft: onSaveDraft,
                onCopyEmail: onCopyEmail,
                emailGenerating: emailGenerating,
                emailSending: emailSending,
              ),
      ),
    );
  }
}

class _NoSelection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.person_outline, size: 56, color: Colors.grey),
          const SizedBox(height: 18),
          Text(
            'Select an employee',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 10),
          Text(
            'Choose a row from the list to review profile details, generate an email, and send outreach.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }
}

class _DetailContent extends StatelessWidget {
  const _DetailContent({
    required this.employee,
    required this.emailSubjectController,
    required this.emailBodyController,
    required this.onGenerateEmail,
    required this.onSendEmail,
    required this.onSaveDraft,
    required this.onCopyEmail,
    required this.emailGenerating,
    required this.emailSending,
  });

  final Employee employee;
  final TextEditingController? emailSubjectController;
  final TextEditingController? emailBodyController;
  final VoidCallback onGenerateEmail;
  final VoidCallback onSendEmail;
  final VoidCallback onSaveDraft;
  final VoidCallback onCopyEmail;
  final bool emailGenerating;
  final bool emailSending;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Employee details',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Chip(label: Text(employee.contactStatus.label)),
          ],
        ),
        const SizedBox(height: 20),
        _ProfileSection(employee: employee),
        const SizedBox(height: 20),
        _SectionHeader('Professional information'),
        Text(
          'Title: ${employee.title}',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 6),
        Text(
          'Department: ${employee.department}',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 6),
        Text(
          'Location: ${employee.location}',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 18),
        _SectionHeader('Notes'),
        Text(
          employee.notes.isEmpty ? 'No notes added yet.' : employee.notes,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 18),
        _SectionHeader('Generated email'),
        _EmailEditor(
          employee: employee,
          emailSubjectController: emailSubjectController,
          emailBodyController: emailBodyController,
          onGenerateEmail: onGenerateEmail,
          onSendEmail: onSendEmail,
          onSaveDraft: onSaveDraft,
          onCopyEmail: onCopyEmail,
          emailGenerating: emailGenerating,
          emailSending: emailSending,
        ),
        const SizedBox(height: 18),
        _SectionHeader('Contact history'),
        Text(
          employee.history.isEmpty
              ? 'No contact history yet.'
              : employee.history,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ],
    );
  }
}

class _ProfileSection extends StatelessWidget {
  const _ProfileSection({required this.employee});

  final Employee employee;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(employee.name, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(employee.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(employee.company, style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _MiniInfo(label: 'Location', value: employee.location),
              _MiniInfo(label: 'Profile', value: employee.publicProfile),
              _MiniInfo(
                label: 'Email',
                value: employee.email ?? 'Not available',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniInfo extends StatelessWidget {
  const _MiniInfo({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 4),
        SizedBox(
          width: 220,
          child: Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
    );
  }
}

class _EmailEditor extends StatelessWidget {
  const _EmailEditor({
    required this.employee,
    required this.emailSubjectController,
    required this.emailBodyController,
    required this.onGenerateEmail,
    required this.onSendEmail,
    required this.onSaveDraft,
    required this.onCopyEmail,
    required this.emailGenerating,
    required this.emailSending,
  });

  final Employee employee;
  final TextEditingController? emailSubjectController;
  final TextEditingController? emailBodyController;
  final VoidCallback onGenerateEmail;
  final VoidCallback onSendEmail;
  final VoidCallback onSaveDraft;
  final VoidCallback onCopyEmail;
  final bool emailGenerating;
  final bool emailSending;

  @override
  Widget build(BuildContext context) {
    if (emailGenerating) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const LinearProgressIndicator(),
          const SizedBox(height: 12),
          Text(
            'Generating a personalized message...',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ],
      );
    }

    if (employee.generatedEmailBody == null) {
      return FilledButton.icon(
        onPressed: onGenerateEmail,
        icon: const Icon(Icons.smart_toy_outlined),
        label: const Text('Generate Personalized Email'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: emailSubjectController,
          decoration: const InputDecoration(
            labelText: 'Subject',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: TextField(
            controller: emailBodyController,
            decoration: const InputDecoration(
              labelText: 'Message',
              border: OutlineInputBorder(),
            ),
            maxLines: null,
            expands: true,
            keyboardType: TextInputType.multiline,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            OutlinedButton.icon(
              onPressed: onGenerateEmail,
              icon: const Icon(Icons.refresh),
              label: const Text('Regenerate'),
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              onPressed: onSaveDraft,
              icon: const Icon(Icons.save_outlined),
              label: const Text('Save draft'),
            ),
            const SizedBox(width: 12),
            FilledButton.icon(
              onPressed: emailSending ? null : onSendEmail,
              icon: const Icon(Icons.send),
              label: Text(emailSending ? 'Sending...' : 'Send'),
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              onPressed: onCopyEmail,
              icon: const Icon(Icons.copy),
              label: const Text('Copy'),
            ),
          ],
        ),
      ],
    );
  }
}

extension StringCapitalized on String {
  String get capitalized =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}
