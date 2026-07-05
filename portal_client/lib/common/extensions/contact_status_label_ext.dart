import 'package:portal_client/common/enums/contact_status.dart';

extension ContactStatusLabel on ContactStatus {
  String get label {
    switch (this) {
      case ContactStatus.newLead:
        return 'New';
      case ContactStatus.emailGenerated:
        return 'Email Generated';
      case ContactStatus.contacted:
        return 'Contacted';
    }
  }
}
