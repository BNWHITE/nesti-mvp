import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nesti Test',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Nesti v2'),
          backgroundColor: const Color(0xFF6366F1),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.family_restroom, size: 100, color: Color(0xFF6366F1)),
              SizedBox(height: 20),
              Text(
                'Bienvenue sur Nesti !',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 10),
              Text('Application familiale sécurisée'),
            ],
          ),
        ),
      ),
    );
  }
}


