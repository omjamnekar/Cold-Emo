import 'package:portal_client/common/enums/project_status.dart';
import 'package:portal_client/common/models/employee.dart';

class Project {
  final String companyName;
  final String notes;
  ProjectStatus status;
  DateTime lastUpdated;
  int employeeCount;
  double searchProgress;
  List<Employee> employees;

  Project({
    required this.companyName,
    required this.notes,
    required this.status,
    required this.lastUpdated,
    required this.employeeCount,
    required this.searchProgress,
    required this.employees,
  });
}
