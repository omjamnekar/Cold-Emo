import 'package:flutter/material.dart';
import 'package:portal_client/common/enums/project_status.dart';

class SectionStatusBadge extends StatelessWidget {
  const SectionStatusBadge({super.key, required this.status});

  final ProjectStatus status;

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(status);
    return Chip(
      label: Text(_statusLabel(status)),
      backgroundColor: color.withOpacity(0.14),
      labelStyle: TextStyle(color: color.darken()),
    );
  }

  String _statusLabel(ProjectStatus status) {
    switch (status) {
      case ProjectStatus.idle:
        return 'Idle';
      case ProjectStatus.searching:
        return 'Searching';
      case ProjectStatus.completed:
        return 'Completed';
      case ProjectStatus.failed:
        return 'Failed';
    }
  }

  Color _statusColor(ProjectStatus status) {
    switch (status) {
      case ProjectStatus.idle:
        return Colors.grey.shade700;
      case ProjectStatus.searching:
        return Colors.indigo;
      case ProjectStatus.completed:
        return Colors.green.shade700;
      case ProjectStatus.failed:
        return Colors.red.shade700;
    }
  }
}

extension ColorDarken on Color {
  Color darken([double amount = .2]) {
    final hsl = HSLColor.fromColor(this);
    return hsl
        .withLightness((hsl.lightness - amount).clamp(0.0, 1.0))
        .toColor();
  }
}
