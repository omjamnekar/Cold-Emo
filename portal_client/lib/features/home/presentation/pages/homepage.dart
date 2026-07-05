import 'dart:async';

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:portal_client/common/enums/contact_status.dart';
import 'package:portal_client/common/enums/project_status.dart';
import 'package:portal_client/common/enums/sort_option.dart';
import 'package:portal_client/common/models/employee.dart';
import 'package:portal_client/common/models/project.dart';
import 'package:portal_client/features/home/presentation/widgets/home_drawer.dart';
import 'package:portal_client/features/home/presentation/widgets/home_navigation_rail.dart';
import 'package:portal_client/features/home/presentation/widgets/project_workspace.dart';
import 'package:portal_client/features/home/presentation/widgets/projects_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 1;

  final List<Project> _projects = [
    Project(
      companyName: 'Google',
      notes: 'Target company for next outreach wave.',
      status: ProjectStatus.idle,
      lastUpdated: DateTime.now().subtract(const Duration(hours: 5)),
      employeeCount: 0,
      searchProgress: 0,
      employees: [],
    ),
  ];

  Project? _activeProject;
  Employee? _selectedEmployee;
  bool _searchRunning = false;
  bool _emailGenerating = false;
  bool _emailSending = false;
  String _searchStatus = 'Ready to search';
  double _searchProgress = 0;
  int _searchStep = 0;
  Timer? _searchTimer;
  String _searchQuery = '';
  ContactStatus? _filterStatus;
  SortOption _sortOption = SortOption.name;
  TextEditingController? _emailSubjectController;
  TextEditingController? _emailBodyController;

  static const List<String> _searchPhases = [
    'Searching public sources...',
    'Collecting employee profiles...',
    'Verifying information...',
    'Saving results...',
    'Finishing search...',
  ];

  static final List<Employee> _searchCandidates = [
    Employee(
      name: 'Ava Chen',
      title: 'Product Manager',
      department: 'Growth',
      location: 'San Francisco, CA',
      publicProfile: 'linkedin.com/in/avachen',
      company: 'Google',
      contactStatus: ContactStatus.newLead,
    ),
    Employee(
      name: 'Jordan Patel',
      title: 'Software Engineer',
      department: 'AI Platform',
      location: 'Mountain View, CA',
      publicProfile: 'linkedin.com/in/jordan-patel',
      company: 'Google',
      contactStatus: ContactStatus.newLead,
    ),
    Employee(
      name: 'Maya Brooks',
      title: 'Engineering Lead',
      department: 'Search',
      location: 'New York, NY',
      publicProfile: 'linkedin.com/in/mayabrooks',
      company: 'Google',
      contactStatus: ContactStatus.newLead,
    ),
    Employee(
      name: 'Ethan Green',
      title: 'UX Researcher',
      department: 'Workspace',
      location: 'Austin, TX',
      publicProfile: 'linkedin.com/in/ethangreen',
      company: 'Google',
      contactStatus: ContactStatus.newLead,
    ),
    Employee(
      name: 'Priya Shah',
      title: 'Technical Program Manager',
      department: 'Cloud',
      location: 'Seattle, WA',
      publicProfile: 'linkedin.com/in/priyashah',
      company: 'Google',
      contactStatus: ContactStatus.newLead,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _activeProject = _projects.first;
  }

  @override
  void dispose() {
    _searchTimer?.cancel();
    _emailSubjectController?.dispose();
    _emailBodyController?.dispose();
    super.dispose();
  }

  void _showNotification(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  void _openProject(Project project) {
    setState(() {
      _activeProject = project;
      _selectedEmployee = null;
      _searchQuery = '';
      _filterStatus = null;
      _sortOption = SortOption.name;
    });
  }

  void _deleteProject(Project project) {
    setState(() {
      _projects.remove(project);
      if (_activeProject == project) {
        _activeProject = _projects.isNotEmpty ? _projects.first : null;
        _selectedEmployee = null;
      }
    });
    _showNotification('Project deleted');
  }

  Future<void> _createProject() async {
    final formKey = GlobalKey<FormState>();
    var companyName = '';
    var notes = '';

    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('New Project'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  autofocus: true,
                  decoration: const InputDecoration(labelText: 'Company name'),
                  validator: (value) => (value?.trim().isEmpty ?? true)
                      ? 'Enter a company name'
                      : null,
                  onSaved: (value) => companyName = value!.trim(),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Notes (optional)',
                    hintText: 'What are you targeting for this company?',
                  ),
                  maxLines: 3,
                  onSaved: (value) => notes = value?.trim() ?? '',
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).maybePop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                if (formKey.currentState?.validate() ?? false) {
                  formKey.currentState?.save();
                  Navigator.of(context).pop(true);
                }
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    );

    if (result == true && companyName.isNotEmpty) {
      final project = Project(
        companyName: companyName,
        notes: notes,
        status: ProjectStatus.idle,
        lastUpdated: DateTime.now(),
        employeeCount: 0,
        searchProgress: 0,
        employees: [],
      );

      setState(() {
        _projects.insert(0, project);
        _activeProject = project;
        _selectedEmployee = null;
      });

      _showNotification('Project created');
    }
  }

  void _startSearch() {
    if (_activeProject == null || _searchRunning) return;

    setState(() {
      _searchRunning = true;
      _searchStatus = _searchPhases.first;
      _searchProgress = 0;
      _searchStep = 0;
      _activeProject!.status = ProjectStatus.searching;
      _activeProject!.employees.clear();
      _activeProject!.employeeCount = 0;
    });

    _searchTimer?.cancel();
    _searchTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final phaseIndex = _searchStep.clamp(0, _searchPhases.length - 1);
      setState(() {
        _searchStatus = _searchPhases[phaseIndex];
        _searchProgress = (_searchStep + 1) / (_searchCandidates.length + 1);
      });

      if (_searchStep < _searchCandidates.length) {
        final nextEmployee = _searchCandidates[_searchStep].copyWith(
          email:
              'hello.${_searchCandidates[_searchStep].name.toLowerCase().replaceAll(' ', '.')}@example.com',
        );
        setState(() {
          _activeProject!.employees.add(nextEmployee);
          _activeProject!.employeeCount = _activeProject!.employees.length;
        });
        _showNotification('Employee added: ${nextEmployee.name}');
      }

      _searchStep += 1;

      if (_searchStep > _searchCandidates.length) {
        _searchTimer?.cancel();
        setState(() {
          _searchRunning = false;
          _activeProject!.status = ProjectStatus.completed;
          _activeProject!.searchProgress = 1;
          _activeProject!.lastUpdated = DateTime.now();
          _searchStatus = 'Search complete';
          _searchProgress = 1;
        });
        _showNotification('Search completed');
      }
    });

    _showNotification('Search started');
  }

  void _refreshSearch() {
    if (_activeProject == null) return;
    _startSearch();
    _showNotification('Search refreshed');
  }

  void _setSelectedEmployee(Employee employee) {
    _emailSubjectController?.dispose();
    _emailBodyController?.dispose();

    _emailSubjectController = TextEditingController(
      text:
          employee.generatedEmailSubject ??
          'Hi ${employee.name.split(' ').first}, let�s connect about a role at ${employee.company}',
    );
    _emailBodyController = TextEditingController(
      text:
          employee.generatedEmailBody ??
          'Hi ${employee.name.split(' ').first},\n\nI noticed your work in ${employee.department} at ${employee.company}. I would love to discuss how my background aligns with your team�s goals and the potential for collaboration.\n\nBest regards,',
    );

    setState(() {
      _selectedEmployee = employee;
    });
  }

  Future<void> _generateEmail() async {
    if (_selectedEmployee == null) return;

    setState(() {
      _emailGenerating = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _emailGenerating = false;
      _selectedEmployee = _selectedEmployee!.copyWith(
        generatedEmailSubject: _emailSubjectController?.text,
        generatedEmailBody: _emailBodyController?.text,
        contactStatus: ContactStatus.emailGenerated,
      );
      final index = _activeProject!.employees.indexWhere(
        (employee) => employee.id == _selectedEmployee!.id,
      );
      if (index >= 0) {
        _activeProject!.employees[index] = _selectedEmployee!;
      }
    });

    _showNotification('Email generated');
  }

  Future<void> _sendEmail() async {
    if (_selectedEmployee == null) return;

    setState(() {
      _emailSending = true;
    });

    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      _emailSending = false;
      _selectedEmployee = _selectedEmployee!.copyWith(
        contactStatus: ContactStatus.contacted,
      );
      final index = _activeProject!.employees.indexWhere(
        (employee) => employee.id == _selectedEmployee!.id,
      );
      if (index >= 0) {
        _activeProject!.employees[index] = _selectedEmployee!;
      }
    });

    _showNotification('Email sent');
  }

  void _updateSortOption(SortOption? option) {
    if (option == null) return;
    setState(() {
      _sortOption = option;
    });
  }

  void _copyEmail() {
    if (_emailSubjectController == null || _emailBodyController == null) return;
    final subject = _emailSubjectController!.text;
    final body = _emailBodyController!.text;
    if (subject.isEmpty && body.isEmpty) return;

    Clipboard.setData(ClipboardData(text: '$subject\n\n$body'));
    _showNotification('Email copied to clipboard');
  }

  void _saveDraft() {
    _showNotification('Draft saved');
  }

  void _openSettings() {
    _showNotification('Open project settings');
  }

  @override
  Widget build(BuildContext context) {
    final content = _selectedIndex == 1 && _activeProject != null
        ? ProjectWorkspace(
            activeProject: _activeProject!,
            searchRunning: _searchRunning,
            searchStatus: _searchStatus,
            searchProgress: _searchProgress,
            selectedEmployee: _selectedEmployee,
            searchQuery: _searchQuery,
            filterStatus: _filterStatus,
            sortOption: _sortOption,
            emailSubjectController: _emailSubjectController,
            emailBodyController: _emailBodyController,
            onSearchQueryChanged: (value) =>
                setState(() => _searchQuery = value),
            onFilterStatusChanged: (value) =>
                setState(() => _filterStatus = value),
            onSortOptionChanged: _updateSortOption,
            onSelectEmployee: _setSelectedEmployee,
            onStartSearch: _startSearch,
            onRefreshSearch: _refreshSearch,
            onOpenSettings: _openSettings,
            onGenerateEmail: _generateEmail,
            onSendEmail: _sendEmail,
            onSaveDraft: _saveDraft,
            onCopyEmail: _copyEmail,
            emailGenerating: _emailGenerating,
            emailSending: _emailSending,
          )
        : ProjectsPage(
            projects: _projects,
            onCreateProject: _createProject,
            onOpenProject: _openProject,
            onDeleteProject: _deleteProject,
          );

    return Scaffold(
      appBar: AppBar(title: const Text('Job Outreach Assistant')),
      drawer: HomeDrawer(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 1000;
          if (isWide) {
            return Row(
              children: [
                HomeNavigationRail(
                  selectedIndex: _selectedIndex,
                  extended: true,
                  onDestinationSelected: (index) =>
                      setState(() => _selectedIndex = index),
                ),
                const VerticalDivider(width: 1),
                Expanded(child: content),
              ],
            );
          }

          return content;
        },
      ),
    );
  }
}
