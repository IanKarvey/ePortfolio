// Portfolio demo of the Barangay Safety resident app (karveyportfolio.vercel.app).
//
// The real resident screens — home, report form, "how to report" tutorial and
// report detail — over a sample account and a backend that lives in the page.
// A report filed here is posted to the portfolio page, which hands it to the
// barangay-hall dashboard demo next to it; what the hall does comes back the
// same way, so the resident sees the real "help is on the way" pop-up.
// GPS comes from the page (a fixed spot in Barangay 3), never from the visitor.
//
//   flutter build web -t tool/portfolio_demo/resident.dart -o build/portfolio_resident \
//     --base-href /demos/barangay-resident/ --release
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:js_interop';
import 'dart:ui' show PlatformDispatcher;

import 'package:barangay_safety_app/l10n/app_strings.dart';
import 'package:barangay_safety_app/models/incident_model.dart';
import 'package:barangay_safety_app/models/notification_model.dart';
import 'package:barangay_safety_app/models/user_model.dart';
import 'package:barangay_safety_app/providers/auth_provider.dart';
import 'package:barangay_safety_app/providers/incident_provider.dart';
import 'package:barangay_safety_app/providers/language_provider.dart';
import 'package:barangay_safety_app/providers/notification_provider.dart';
import 'package:barangay_safety_app/screens/resident/report_detail_screen.dart';
import 'package:barangay_safety_app/screens/resident/report_form_screen.dart';
import 'package:barangay_safety_app/screens/resident/report_tutorial_screen.dart';
import 'package:barangay_safety_app/screens/resident/resident_home_screen.dart';
import 'package:barangay_safety_app/utils/theme.dart';
import 'package:barangay_safety_app/widgets/alert_host.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'package:web/web.dart' as web;

const _barangayId = '00000000-0000-4000-8000-0000000000c3';
const _barangayName = 'Barangay 3';
final _navigatorKey = GlobalKey<NavigatorState>();

final _resident = UserModel(
  id: '00000000-0000-4000-8000-0000000000e1',
  email: 'maria@demo.ph',
  fullName: 'Maria Santos',
  phone: '09170000001',
  role: 'resident',
  barangayId: _barangayId,
  barangayName: _barangayName,
  isVerified: true,
  createdAt: DateTime.now().subtract(const Duration(days: 120)),
  updatedAt: DateTime.now(),
);

IncidentModel _report(String category, String status, String description,
    {int severity = 1, Duration ago = Duration.zero, String? landmark, String? id}) {
  final created = DateTime.now().subtract(ago);
  final done = status == 'resolved';
  return IncidentModel(
    id: id ?? const Uuid().v4(),
    reporterId: _resident.id,
    reporterName: _resident.fullName,
    reporterPhone: _resident.phone,
    barangayId: _barangayId,
    barangayName: _barangayName,
    category: category,
    description: description,
    severityLevel: severity,
    status: status,
    latitude: 13.9400,
    longitude: 121.1610,
    address: 'Poblacion $_barangayName, Lipa City, Batangas',
    landmark: landmark,
    createdAt: created,
    updatedAt: done ? created.add(const Duration(hours: 2)) : created,
    verifiedAt: done ? created.add(const Duration(minutes: 4)) : null,
    respondingAt: done ? created.add(const Duration(minutes: 9)) : null,
    resolvedAt: done ? created.add(const Duration(hours: 2)) : null,
    assignedToName: done ? 'Juan Dela Cruz' : null,
  );
}

final _mine = <IncidentModel>[
  _report('Noise Disturbance', 'resolved', 'Loud karaoke past 10 PM beside our house.',
      ago: const Duration(days: 4, hours: 3), landmark: 'Near the basketball court'),
];

IncidentModel _withStatus(IncidentModel i, String status, String by) {
  final now = DateTime.now();
  final moving = status != 'pending' && status != 'verified';
  return IncidentModel(
    id: i.id, reporterId: i.reporterId, reporterName: i.reporterName, reporterPhone: i.reporterPhone,
    barangayId: i.barangayId, barangayName: i.barangayName, category: i.category, description: i.description,
    severityLevel: i.severityLevel, status: status, latitude: i.latitude, longitude: i.longitude,
    address: i.address, landmark: i.landmark, photoUrls: i.photoUrls, videoUrls: i.videoUrls,
    assignedToName: moving ? by : i.assignedToName, createdAt: i.createdAt, updatedAt: now,
    verifiedAt: i.verifiedAt ?? (status != 'pending' ? now : null),
    respondingAt: i.respondingAt ?? (moving ? now : null),
    onSceneAt: i.onSceneAt ?? (status == 'on_scene' || status == 'resolved' ? now : null),
    resolvedAt: status == 'resolved' ? now : null,
    escalationLevel: i.escalationLevel,
  );
}

void _post(Map<String, Object?> message) {
  web.window.parent?.postMessage(jsonEncode(message).toJS, '*'.toJS);
}

class _DemoAuth extends ChangeNotifier implements AuthProvider {
  @override
  UserModel? get user => _resident;
  @override
  bool get isLoading => false;
  @override
  String? get error => null;
  @override
  DateTime? get suspensionExpiry => null;
  @override
  bool get isAuthenticated => true;
  @override
  bool get isResident => true;
  @override
  bool get isAdmin => false;
  @override
  bool get isOfficial => false;
  @override
  bool get isSuperAdmin => false;
  @override
  Future<void> initialize() async {}
  @override
  Future<void> signOut() async {}
  @override
  Future<void> refreshProfile() async {}
  @override
  dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

class _DemoIncidents extends ChangeNotifier implements IncidentProvider {
  IncidentModel? _selected;

  @override
  List<IncidentModel> get incidents => _mine;
  @override
  List<IncidentModel> get myIncidents => _mine;
  @override
  IncidentModel? get selectedIncident => _selected;
  @override
  Map<String, int> get stats => const {};
  @override
  bool get isLoading => false;
  @override
  bool get myIncidentsLoading => false;
  @override
  String? get error => null;
  @override
  String? get statusFilter => null;
  @override
  int? get severityFilter => null;

  void apply(String id, String status, String by) {
    final at = _mine.indexWhere((i) => i.id == id);
    if (at < 0) return;
    _mine[at] = _withStatus(_mine[at], status, by);
    if (_selected?.id == id) _selected = _mine[at];
    notifyListeners();
  }

  @override
  Future<IncidentModel?> createIncident({
    required String reporterId,
    required String barangayId,
    required String category,
    required String description,
    required int severityLevel,
    required double latitude,
    required double longitude,
    String? address,
    String? landmark,
    List<File> photos = const [],
    List<File> videos = const [],
    bool reportedViaVpn = false,
    bool locationMocked = false,
  }) async {
    await Future.delayed(const Duration(milliseconds: 700)); // a believable upload
    final report = _report(category, 'pending', description, severity: severityLevel, landmark: landmark);
    _mine.insert(0, report);
    notifyListeners();
    _post({
      'type': 'report', 'id': report.id, 'category': category, 'description': description,
      'severity': severityLevel, 'landmark': landmark, 'reporter': _resident.fullName,
    });
    return report;
  }

  @override
  Future<void> loadIncident(String id, {bool silent = false}) async {
    _selected = _mine.firstWhere((i) => i.id == id, orElse: () => _mine.first);
    notifyListeners();
  }

  @override
  Future<bool> deleteIncident(String incidentId) async {
    _mine.removeWhere((i) => i.id == incidentId);
    notifyListeners();
    return true;
  }

  @override
  Future<void> loadMyIncidents(String reporterId, {bool silent = false}) async {}
  @override
  Future<void> loadBarangayIncidents(String id, {bool silent = false}) async {}
  @override
  Future<void> loadAllIncidents({bool silent = false}) async {}
  @override
  Future<void> loadStats(String? id) async {}
  @override
  void subscribeToMyIncidents(String reporterId) {}
  @override
  void subscribeToBarangay(String id) {}
  @override
  void subscribeToAll() {}
  @override
  void setStatusFilter(String? status) {}
  @override
  void setSeverityFilter(int? severity) {}
  @override
  void clearFilters() {}
  @override
  void clearError() {}
  @override
  void resetForLogout() {}
  @override
  dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

class _DemoNotifications extends ChangeNotifier implements NotificationProvider {
  final _arrivals = StreamController<NotificationModel>.broadcast();
  final List<NotificationModel> _items = [];

  @override
  Stream<NotificationModel> get arrivals => _arrivals.stream;
  @override
  List<NotificationModel> get notifications => _items;
  @override
  int get unreadCount => _items.where((n) => !n.isRead).length;
  @override
  bool get isLoading => false;

  void push(NotificationModel n) {
    _items.insert(0, n);
    notifyListeners();
    _arrivals.add(n);
  }

  @override
  void subscribe() {}
  @override
  void unsubscribe() {}
  @override
  Future<void> load() async {}
  @override
  Future<void> markRead(String id) async {
    final at = _items.indexWhere((n) => n.id == id);
    if (at < 0) return;
    final n = _items[at];
    _items[at] = NotificationModel(id: n.id, userId: n.userId, title: n.title, body: n.body, type: n.type,
        incidentId: n.incidentId, isRead: true, createdAt: n.createdAt, data: n.data);
    notifyListeners();
  }

  @override
  Future<void> markAllRead() async {
    for (final n in List.of(_items)) {
      await markRead(n.id);
    }
  }

  @override
  void dismiss(String id) {
    _items.removeWhere((n) => n.id == id);
    notifyListeners();
  }

  @override
  dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

final _incidentsProvider = _DemoIncidents();
final _notificationsProvider = _DemoNotifications();

/// Every Supabase call is answered here; nothing leaves the page.
class _InPageBackend extends http.BaseClient {
  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final body = utf8.encode(request.url.path.contains('/auth/') ? '{}' : '[]');
    return http.StreamedResponse(Stream.value(body), 200,
        contentLength: body.length,
        request: request,
        headers: const {'content-type': 'application/json; charset=utf-8', 'content-range': '0-0/0'});
  }
}

/// What the barangay hall does, as relayed by the portfolio page.
void _listen() {
  web.window.addEventListener(
    'message',
    ((web.MessageEvent e) {
      final data = e.data;
      if (data == null || !data.isA<JSString>()) return;
      final Object? m;
      try {
        m = jsonDecode((data as JSString).toDart);
      } catch (_) {
        return;
      }
      if (m is! Map) return;
      final id = m['id'] as String?;
      if (id == null || !_mine.any((i) => i.id == id)) return;
      final category = _mine.firstWhere((i) => i.id == id).category;
      // A newer update replaces an older pop-up ("officials are busy" must not
      // resurface after "help is on the way").
      _navigatorKey.currentState?.popUntil((route) => route is! PopupRoute);
      if (m['type'] == 'status') {
        final status = m['status'] as String? ?? 'pending';
        final by = m['by'] as String? ?? 'Juan Dela Cruz';
        _incidentsProvider.apply(id, status, by);
        if (status == 'responding') {
          _notificationsProvider.push(NotificationModel(
            id: 'resp-$id', userId: _resident.id, title: 'Help is on the way',
            body: '$by is responding to your $category report.', type: 'responder_update',
            incidentId: id, isRead: false, createdAt: DateTime.now(),
            data: {'role': 'secretary', 'name': by},
          ));
        } else {
          _notificationsProvider.push(NotificationModel(
            id: 'st-$id-$status', userId: _resident.id, title: 'Report status updated',
            body: 'Your $category report is now ${status.replaceAll('_', ' ')}.', type: 'status_change',
            incidentId: id, isRead: false, createdAt: DateTime.now(),
          ));
        }
      } else if (m['type'] == 'escalated') {
        _notificationsProvider.push(NotificationModel(
          id: 'esc-$id', userId: _resident.id, title: 'More officials alerted',
          body: 'Your $category report had no response yet, so more officials were alerted.',
          type: 'escalation_resident', incidentId: id, isRead: false, createdAt: DateTime.now(),
          data: {'level': (m['level'] as num?)?.toInt() ?? 1},
        ));
      }
    }).toJS,
  );
}

Route<dynamic> _routes(RouteSettings s) {
  final Widget page = switch (s.name) {
    '/report-form' => const ReportFormScreen(),
    '/report-tutorial' => ReportTutorialScreen(
        source: (s.arguments as Map<String, dynamic>?)?['source'] as String? ?? 'button',
        initialStep: (s.arguments as Map<String, dynamic>?)?['step'] as int? ?? 0,
      ),
    '/report-detail' => ReportDetailScreen(incidentId: s.arguments as String),
    _ => const ResidentHomeScreen(),
  };
  return MaterialPageRoute(builder: (_) => page, settings: s);
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  FlutterError.onError = (d) => debugPrint('FLUTTER ERROR: ${d.exceptionAsString()}');
  PlatformDispatcher.instance.onError = (e, s) {
    debugPrint('ASYNC ERROR: $e');
    return true;
  };
  await initializeDateFormatting('en_US');
  await Supabase.initialize(
    url: 'https://portfolio-demo.invalid',
    anonKey: 'portfolio-demo',
    httpClient: _InPageBackend(),
    debug: false,
  );
  _listen();
  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => _DemoAuth()),
      ChangeNotifierProvider<IncidentProvider>.value(value: _incidentsProvider),
      ChangeNotifierProvider<NotificationProvider>.value(value: _notificationsProvider),
      ChangeNotifierProvider(create: (_) => LanguageProvider()..load()),
    ],
    child: Consumer<LanguageProvider>(
      builder: (context, lang, _) => AppStringsScope(
        language: lang.language,
        strings: lang.strings,
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Barangay Safety',
          theme: AppTheme.lightTheme,
          navigatorKey: _navigatorKey,
          // `home`, not initialRoute: '/resident' — that would also build '/' underneath,
          // and two home screens would each open the first-visit tutorial.
          home: const ResidentHomeScreen(),
          onGenerateRoute: _routes,
          builder: (context, child) => AlertHost(navigatorKey: _navigatorKey, child: child ?? const SizedBox()),
        ),
      ),
    ),
  ));
  _post({'type': 'ready', 'app': 'resident'});
}
