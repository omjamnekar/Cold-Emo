import 'package:flutter/material.dart';

class HomeNavigationRail extends StatelessWidget {
  const HomeNavigationRail({
    super.key,
    required this.selectedIndex,
    required this.extended,
    required this.onDestinationSelected,
  });

  final int selectedIndex;
  final bool extended;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    const menuEntries = [
      _NavigationItem(label: 'Dashboard', icon: Icons.dashboard),
      _NavigationItem(label: 'Projects', icon: Icons.folder_open),
      _NavigationItem(label: 'Messages', icon: Icons.message),
      _NavigationItem(label: 'Settings', icon: Icons.settings),
    ];

    return NavigationRail(
      extended: extended,
      selectedIndex: selectedIndex,
      onDestinationSelected: onDestinationSelected,
      labelType: extended
          ? NavigationRailLabelType.none
          : NavigationRailLabelType.selected,
      leading: Padding(
        padding: const EdgeInsets.only(top: 12),
        child: Icon(
          Icons.work_outline,
          size: 32,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
      destinations: menuEntries
          .map(
            (entry) => NavigationRailDestination(
              icon: Icon(entry.icon),
              selectedIcon: Icon(
                entry.icon,
                color: Theme.of(context).colorScheme.primary,
              ),
              label: Text(entry.label),
            ),
          )
          .toList(),
    );
  }
}

class _NavigationItem {
  const _NavigationItem({required this.label, required this.icon});

  final String label;
  final IconData icon;
}
