import 'package:flutter/material.dart';
import 'package:portal_client/common/enums/contact_status.dart';

class Employee {
  final String id;
  final String name;
  final String title;
  final String department;
  final String location;
  final String publicProfile;
  final String company;
  final ContactStatus contactStatus;
  final String? email;
  final String notes;
  final String history;
  final String? generatedEmailSubject;
  final String? generatedEmailBody;

  Employee({
    String? id,
    required this.name,
    required this.title,
    required this.department,
    required this.location,
    required this.publicProfile,
    required this.company,
    this.contactStatus = ContactStatus.newLead,
    this.email,
    this.notes = '',
    this.history = '',
    this.generatedEmailSubject,
    this.generatedEmailBody,
  }) : id = id ?? UniqueKey().toString();

  Employee copyWith({
    String? id,
    String? name,
    String? title,
    String? department,
    String? location,
    String? publicProfile,
    String? company,
    ContactStatus? contactStatus,
    String? email,
    String? notes,
    String? history,
    String? generatedEmailSubject,
    String? generatedEmailBody,
  }) {
    return Employee(
      id: id ?? this.id,
      name: name ?? this.name,
      title: title ?? this.title,
      department: department ?? this.department,
      location: location ?? this.location,
      publicProfile: publicProfile ?? this.publicProfile,
      company: company ?? this.company,
      contactStatus: contactStatus ?? this.contactStatus,
      email: email ?? this.email,
      notes: notes ?? this.notes,
      history: history ?? this.history,
      generatedEmailSubject:
          generatedEmailSubject ?? this.generatedEmailSubject,
      generatedEmailBody: generatedEmailBody ?? this.generatedEmailBody,
    );
  }
}
