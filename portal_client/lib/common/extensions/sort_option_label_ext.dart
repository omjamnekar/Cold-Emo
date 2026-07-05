import 'package:portal_client/common/enums/sort_option.dart';

extension SortOptionLabel on SortOption {
  String get label {
    switch (this) {
      case SortOption.name:
        return 'Sort: Name';
      case SortOption.status:
        return 'Sort: Status';
      case SortOption.location:
        return 'Sort: Location';
    }
  }
}
