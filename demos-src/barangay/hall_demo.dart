// Portfolio demo of the Barangay Safety web dashboard (karveyportfolio.vercel.app).
//
// The real shell (WebShell), the real route table and the real screens, over
// sample data and a backend that lives in the page: every Supabase call is
// answered here, so nothing leaves the browser and no real record can ever be
// reached. The portfolio page around it plays the resident — a report sent from
// its phone arrives through window.postMessage, and every status change made on
// this dashboard is posted back, so the phone can show "help is on the way".
//
//   flutter build web -t tool/portfolio_demo/main.dart -o build/portfolio_demo \
//     --base-href /demos/barangay/ --release
import 'dart:async';
import 'dart:convert';
import 'dart:js_interop';
import 'dart:ui' show PlatformDispatcher;

import 'package:barangay_safety_app/l10n/app_strings.dart';
import 'package:barangay_safety_app/main_web.dart'
    show webNavigatorKey, webOnGenerateRoute;
import 'package:barangay_safety_app/models/incident_model.dart';
import 'package:barangay_safety_app/models/notification_model.dart';
import 'package:barangay_safety_app/models/user_model.dart';
import 'package:barangay_safety_app/providers/auth_provider.dart';
import 'package:barangay_safety_app/providers/incident_provider.dart';
import 'package:barangay_safety_app/providers/language_provider.dart';
import 'package:barangay_safety_app/providers/notification_provider.dart';
import 'package:barangay_safety_app/screens/web/web_shell.dart';
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

final _official = UserModel(
  id: '00000000-0000-4000-8000-0000000000d1',
  email: 'juan@demo.ph',
  fullName: 'Juan Dela Cruz',
  phone: '09170000000',
  role: 'admin',
  position: 'secretary',
  barangayId: _barangayId,
  barangayName: _barangayName,
  isVerified: true,
  createdAt: DateTime.now(),
  updatedAt: DateTime.now(),
);

// ── sample reports ─────────────────────────────────────────────────────────
String _newId() => const Uuid().v4();

IncidentModel _incident(
  String category,
  String status,
  String description, {
  int severity = 1,
  Duration ago = Duration.zero,
  String reporter = 'Ana Reyes',
  double dLat = 0,
  double dLng = 0,
  String? landmark,
  int escalationLevel = 0,
  String? id,
}) {
  final created = DateTime.now().subtract(ago);
  final stage = const ['verified', 'assigned', 'responding', 'on_scene', 'resolved'].indexOf(status);
  final step = ago ~/ 6;
  return IncidentModel(
    id: id ?? _newId(),
    reporterId: '00000000-0000-4000-8000-0000000000e1',
    reporterName: reporter,
    barangayId: _barangayId,
    barangayName: _barangayName,
    category: category,
    description: description,
    severityLevel: severity,
    status: status,
    latitude: 13.9400 + dLat,
    longitude: 121.1610 + dLng,
    address: 'Poblacion $_barangayName, Lipa City, Batangas',
    landmark: landmark,
    createdAt: created,
    updatedAt: created.add(step * (stage + 1)),
    verifiedAt: stage >= 0 ? created.add(step) : null,
    respondingAt: stage >= 2 ? created.add(step * 2) : null,
    onSceneAt: stage >= 3 ? created.add(step * 3) : null,
    resolvedAt: stage >= 4 ? created.add(step * 4) : null,
    firstSeenAt: stage >= 0 ? created.add(const Duration(minutes: 1)) : null,
    firstActionAt: stage >= 0 ? created.add(step) : null,
    escalationLevel: escalationLevel,
    assignedTo: stage >= 1 ? _official.id : null,
    assignedToName: stage >= 1 ? _official.fullName : null,
  );
}

final _incidents = <IncidentModel>[
  _incident('Vehicular Accident', 'pending', 'Motorcycle and tricycle collided at the corner. Rider is conscious but hurt.',
      severity: 3, ago: const Duration(minutes: 7), escalationLevel: 1, reporter: 'Carlo Garcia', dLat: .0012, dLng: .0008, landmark: 'Near the public market'),
  _incident('Medical Emergency', 'responding', 'Elderly neighbour collapsed at home. Family is asking for help.',
      severity: 4, ago: const Duration(minutes: 18), reporter: 'Liza Mendoza', dLat: -.0009, dLng: .0011),
  _incident('Noise Disturbance', 'verified', 'Loud karaoke past 10 PM for the third night.',
      severity: 1, ago: const Duration(hours: 3), reporter: 'Paolo Cruz', dLat: .0005, dLng: -.0014),
  _incident('Flooding', 'resolved', 'Drainage clogged; water up to the ankles along the street.',
      severity: 2, ago: const Duration(days: 1, hours: 2), reporter: 'Grace Bautista', dLat: -.0015, dLng: -.0006),
  _incident('Theft / Robbery', 'resolved', 'Phone snatched near the jeepney terminal.',
      severity: 3, ago: const Duration(days: 2, hours: 5), reporter: 'Mark Ramos', dLat: .0018, dLng: -.0002),
  _incident('Suspicious Activity', 'resolved', 'Unknown person checking parked motorcycles.',
      severity: 2, ago: const Duration(days: 3, hours: 1), reporter: 'Joy Villanueva', dLat: -.0003, dLng: .0019),
];

IncidentModel _withStatus(IncidentModel i, String status) {
  final now = DateTime.now();
  final assigned = status != 'pending' && status != 'verified';
  return IncidentModel(
    id: i.id, reporterId: i.reporterId, reporterName: i.reporterName, reporterPhone: i.reporterPhone,
    barangayId: i.barangayId, barangayName: i.barangayName, category: i.category, description: i.description,
    severityLevel: i.severityLevel, status: status, latitude: i.latitude, longitude: i.longitude,
    address: i.address, landmark: i.landmark, photoUrls: i.photoUrls, videoUrls: i.videoUrls,
    assignedTo: assigned ? (i.assignedTo ?? _official.id) : i.assignedTo,
    assignedToName: assigned ? (i.assignedToName ?? _official.fullName) : i.assignedToName,
    resolutionNotes: i.resolutionNotes, createdAt: i.createdAt, updatedAt: now,
    reportedBySessionId: i.reportedBySessionId,
    verifiedAt: i.verifiedAt ?? (status != 'pending' ? now : null),
    assignedAt: i.assignedAt ?? (assigned ? now : null),
    respondingAt: i.respondingAt ?? (status == 'responding' || status == 'on_scene' || status == 'resolved' ? now : null),
    onSceneAt: i.onSceneAt ?? (status == 'on_scene' || status == 'resolved' ? now : null),
    resolvedAt: status == 'resolved' ? (i.resolvedAt ?? now) : null,
    firstSeenAt: i.firstSeenAt ?? now, firstActionAt: i.firstActionAt ?? now,
    escalationLevel: status == 'pending' ? i.escalationLevel : 0,
  );
}

// ── the bridge to the portfolio page ───────────────────────────────────────
void _post(Map<String, Object?> message) {
  web.window.parent?.postMessage(jsonEncode(message).toJS, '*'.toJS);
}

// ── providers over the sample data ─────────────────────────────────────────
class _DemoAuth extends ChangeNotifier implements AuthProvider {
  @override
  UserModel? get user => _official;
  @override
  bool get isLoading => false;
  @override
  String? get error => null;
  @override
  bool get isAuthenticated => true;
  @override
  bool get isAdmin => true;
  @override
  bool get isOfficial => true;
  @override
  bool get isSuperAdmin => false;
  @override
  bool get isResident => false;
  @override
  DateTime? get suspensionExpiry => null;
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
  List<IncidentModel> get incidents => _incidents;
  @override
  List<IncidentModel> get myIncidents => const [];
  @override
  Map<String, int> get stats => {
        'total': _incidents.length,
        'pending': _incidents.where((i) => i.status == 'pending').length,
        'in_progress': _incidents.where((i) => const ['verified', 'assigned', 'responding', 'on_scene'].contains(i.status)).length,
        'resolved': _incidents.where((i) => i.status == 'resolved' || i.status == 'closed').length,
        'flagged': 0,
      };
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
  @override
  IncidentModel? get selectedIncident => _selected;

  void _replace(String id, IncidentModel Function(IncidentModel) change) {
    final at = _incidents.indexWhere((i) => i.id == id);
    if (at < 0) return;
    _incidents[at] = change(_incidents[at]);
    if (_selected?.id == id) _selected = _incidents[at];
    notifyListeners();
  }

  void add(IncidentModel incident) {
    _incidents.insert(0, incident);
    notifyListeners();
  }

  void setStatus(String id, String status) {
    _replace(id, (i) => _withStatus(i, status));
    _post({'type': 'status', 'id': id, 'status': status, 'by': _official.fullName});
  }

  @override
  Future<void> loadIncident(String id, {bool silent = false}) async {
    _selected = _incidents.firstWhere((i) => i.id == id, orElse: () => _incidents.first);
    notifyListeners();
  }

  @override
  Future<bool> updateStatus(String incidentId, String newStatus,
      {required String officialId, String? resolutionNotes, String? assignedTo}) async {
    setStatus(incidentId, newStatus);
    return true;
  }

  @override
  Future<bool> confirmStillActive(String incidentId, {required String officialId}) async {
    _replace(incidentId, (i) => i.copyWith());
    return true;
  }

  @override
  Future<bool> updateSeverity(String incidentId, int newLevel, {required String officialId}) async {
    _replace(incidentId, (i) => i.copyWith(severityLevel: newLevel));
    return true;
  }

  @override
  Future<bool> assignIncident(String incidentId, String? assignedToId, String? assignedToName,
      {required String officialId}) async {
    _replace(incidentId, (i) => i.copyWith(assignedTo: assignedToId, assignedToName: assignedToName));
    return true;
  }

  @override
  Future<bool> deleteIncident(String incidentId) async => false;
  @override
  Future<void> loadBarangayIncidents(String id, {bool silent = false}) async {}
  @override
  Future<void> loadAllIncidents({bool silent = false}) async {}
  @override
  Future<void> loadMyIncidents(String reporterId, {bool silent = false}) async {}
  @override
  Future<void> loadStats(String? id) async {}
  @override
  void subscribeToBarangay(String id) {}
  @override
  void subscribeToAll() {}
  @override
  void subscribeToMyIncidents(String reporterId) {}
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
    if (at >= 0) {
      final n = _items[at];
      _items[at] = NotificationModel(id: n.id, userId: n.userId, title: n.title, body: n.body, type: n.type,
          incidentId: n.incidentId, isRead: true, createdAt: n.createdAt, data: n.data);
      notifyListeners();
    }
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

// ── a backend that never leaves the page ───────────────────────────────────
class _InPageBackend extends http.BaseClient {
  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final path = request.url.path;
    var body = '[]';
    if (path.endsWith('/rpc/claim_incident')) {
      // "I'm responding": the claim always succeeds for the demo official.
      final params = request is http.Request && request.body.isNotEmpty ? jsonDecode(request.body) : const {};
      final id = (params is Map ? params['p_incident'] : null) as String?;
      if (id != null) {
        final i = _incidents.where((x) => x.id == id).firstOrNull;
        if (i != null && (i.status == 'pending' || i.status == 'verified' || i.status == 'assigned')) {
          _incidentsProvider.setStatus(id, 'responding');
        }
      }
      body = jsonEncode({'claimed': true, 'by_name': _official.fullName, 'by_role': 'secretary'});
    } else if (path.contains('/auth/')) {
      body = '{}';
    }
    final bytes = utf8.encode(body);
    return http.StreamedResponse(Stream.value(bytes), 200,
        contentLength: bytes.length,
        request: request,
        headers: const {'content-type': 'application/json; charset=utf-8', 'content-range': '0-0/0'});
  }
}

// ── reports arriving from the portfolio page's resident phone ─────────────
void _listen() {
  web.window.addEventListener(
    'message',
    ((web.MessageEvent e) {
      final data = e.data;
      if (data == null || !data.isA<JSString>()) return;
      final Object? decoded;
      try {
        decoded = jsonDecode((data as JSString).toDart);
      } catch (_) {
        return;
      }
      if (decoded is! Map || decoded['type'] != 'report') return;
      final incident = _incident(
        (decoded['category'] as String?) ?? 'Other',
        'pending',
        (decoded['description'] as String?) ?? '',
        severity: (decoded['severity'] as num?)?.toInt() ?? 2,
        reporter: (decoded['reporter'] as String?) ?? 'Maria Santos',
        dLat: (decoded['dLat'] as num?)?.toDouble() ?? 0.0006,
        dLng: (decoded['dLng'] as num?)?.toDouble() ?? -0.0004,
        landmark: decoded['landmark'] as String?,
        id: decoded['id'] as String?,  // the resident's own id, so both sides talk about the same report
      );
      _incidentsProvider.add(incident);
      _post({'type': 'received', 'id': incident.id});
      _notificationsProvider.push(NotificationModel(
        id: 'new-${incident.id}', userId: _official.id,
        title: 'New ${incident.category} report',
        body: '${incident.reporterName} reported a ${incident.category.toLowerCase()} in $_barangayName.',
        type: 'new_critical', incidentId: incident.id, isRead: false, createdAt: DateTime.now(),
      ));
      // Auto-escalation, with the demo clock: the real system waits 5 minutes.
      final seconds = (decoded['escalateAfter'] as num?)?.toInt() ?? 25;
      Future.delayed(Duration(seconds: seconds), () {
        final now = _incidents.where((x) => x.id == incident.id).firstOrNull;
        if (now == null || now.status != 'pending') return;
        _notificationsProvider.push(NotificationModel(
          id: 'esc-${incident.id}', userId: _official.id,
          title: 'NO RESPONSE - 5 min',
          body: '${incident.category} in $_barangayName has had no response for 5 min. '
              'Every official in the barangay has now been alerted.',
          type: 'escalation', incidentId: incident.id, isRead: false, createdAt: DateTime.now(),
          data: const {'kind': 'unanswered', 'level': 1},
        ));
        _post({'type': 'escalated', 'id': incident.id, 'level': 1});
      });
    }).toJS,
  );
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
  runApp(const _Demo());
  _post({'type': 'ready', 'app': 'hall'});
}

class _Demo extends StatelessWidget {
  const _Demo();

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
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
            title: 'Barangay Safety — Barangay Hall',
            theme: AppTheme.lightTheme,
            navigatorKey: webNavigatorKey,
            home: const WebShell(),
            onGenerateRoute: webOnGenerateRoute,
            builder: (context, child) => AlertHost(
              navigatorKey: webNavigatorKey,
              child: child ?? const SizedBox(),
            ),
          ),
        ),
      ),
    );
  }
}
