/// Configuration de l'API Backend Elixir/Phoenix
class ApiConfig {
  // URL du backend local (développement)
  static const String baseUrl = 'http://localhost:4000/api';
  
  // URL du backend production (Render)
  static const String productionUrl = 'https://nesti-mvp.onrender.com/api';
  
  // Détection automatique de l'environnement
  static const bool isProduction = bool.fromEnvironment('dart.vm.product', defaultValue: false);
  
  // Utiliser l'URL appropriée selon l'environnement
  static String get apiUrl => isProduction ? productionUrl : baseUrl;
  
  // Endpoints
  static const String healthEndpoint = '/health';
  static const String versionEndpoint = '/version';
  
  // Auth endpoints
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';
  static const String logoutEndpoint = '/auth/logout';
  static const String refreshEndpoint = '/auth/refresh';
  
  // User endpoints
  static const String profileEndpoint = '/users/me';
  static const String updateProfileEndpoint = '/users/me';
  
  // Family endpoints
  static const String familiesEndpoint = '/families';
  static const String familyMembersEndpoint = '/families/{id}/members';
  
  // Posts endpoints
  static const String postsEndpoint = '/posts';
  static const String createPostEndpoint = '/posts';
  
  // Messages endpoints
  static const String messagesEndpoint = '/messages';
  
  // Events endpoints
  static const String eventsEndpoint = '/events';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);
  static const Duration sendTimeout = Duration(seconds: 10);
}
