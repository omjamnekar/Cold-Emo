import 'package:flutter/material.dart';
import 'package:portal_client/features/home/presentation/widgets/side_entry.dart';

class HomeDrawer extends StatelessWidget {
  const HomeDrawer({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  });

  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    const menuEntries = [
      SidebarEntry(label: 'Dashboard', icon: Icons.dashboard),
      SidebarEntry(label: 'Projects', icon: Icons.folder_open),
      SidebarEntry(label: 'Messages', icon: Icons.message),
      SidebarEntry(label: 'Settings', icon: Icons.settings),
    ];

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            DrawerHeader(
              curve: Curves.easeInOut,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
              ),
              child: Align(
                alignment: Alignment.bottomLeft,
                child: Text(
                  'Job Outreach',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            ...List.generate(menuEntries.length, (index) {
              final entry = menuEntries[index];
              return ListTile(
                leading: Icon(entry.icon),
                title: Text(entry.label),
                selected: selectedIndex == index,
                selectedColor: Theme.of(context).colorScheme.primary,
                onTap: () {
                  onDestinationSelected(index);
                  Navigator.of(context).maybePop();
                },
              );
            }),
            const Spacer(),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Sign out'),
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }
}
