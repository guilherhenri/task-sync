# TaskSync API - Observability

## Overview

Stack de observabilidade completo com logs, métricas e dashboards para monitoramento da aplicação.

### Stack

- **Logs**: Winston → Vector → Elasticsearch → Kibana
- **Metrics**: Prometheus Client → Prometheus → Grafana
- **Architecture**: Clean Architecture preservada com abstrações

## Quick Start

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access dashboards
http://localhost:3001  # Grafana (admin/admin123)
http://localhost:9090  # Prometheus
```

## Dashboards

### 1. Golden Signals (Main Dashboard)

**URL**: `http://localhost:3001/d/golden-signals`

**Painéis principais**:

- **HTTP Request Rate**: Requisições por minuto
- **HTTP Error Rate**: Taxa de erro das requisições
- **HTTP Duration**: P95 tempo de resposta
- **System Metrics**: CPU, Memory, Disk usage
- **Database Queries**: Query rate e duração
- **External APIs**: Calls para serviços externos
- **Queue Operations**: Jobs na fila de email
- **Worker Jobs**: Processing dos workers

### 2. Auth Domain Dashboard

**URL**: `http://localhost:3001/d/auth-domain`

**Painéis específicos**:

- **Login Success Rate**: Taxa de sucesso dos logins
- **Failed Login Rate**: Tentativas de login falhadas (segurança)
- **Registration Rate**: Novos usuários por hora
- **Auth Endpoints**: Performance endpoints de auth

## Key Metrics

### HTTP Metrics

```promql
# Request rate
sum(rate(http_requests_total[1m])) * 60

# Error rate
(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Business Metrics

```promql
# Login attempts
sum(rate(business_events_total{action="login"}[1m])) by (status)

# Success rate
(sum(rate(business_events_total{status="success"}[5m])) / sum(rate(business_events_total[5m]))) * 100
```

### Database Metrics

```promql
# Query rate
sum(rate(db_queries_total[1m])) by (operation, table)

# Query duration
histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))
```

## Troubleshooting

### High Error Rate

```promql
# Top error endpoints
topk(5, sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (route, method))

# Database errors
sum(rate(db_queries_total{status="error"}[5m])) by (operation, table)
```

### High Latency

```promql
# Slowest endpoints
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (route))

# Slow database queries
histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m])) by (table, operation)
```

### Queue Issues

```promql
# Queue size growing
queue_size_current{state="waiting"}

# Failed jobs
sum(rate(worker_jobs_total{status="failed"}[5m]))
```

## Alerts Recomendados (Produção)

### Critical

- HTTP Error Rate > 5% (5min)
- HTTP P95 Latency > 2s (5min)
- Database Error Rate > 1% (5min)
- Worker Success Rate < 95% (10min)

### Warning

- CPU Usage > 80% (10min)
- Memory Usage > 90% (10min)
- Disk Usage > 85% (15min)
- Queue Size > 100 jobs (5min)

## Maintenance

### Data Retention

```yaml
# prometheus.yml
global:
  retention: "30d" # Keep 30 days of data
```

### Backup Queries

```bash
# Export dashboard
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/dashboards/uid/<uid> > dashboard.json
```

### Cleanup

```bash
# Remove old containers
docker system prune -f

# Check disk usage
docker system df
```

## Development

### Adding New Metrics

1. Add metric to `MetricsService` and create method to record the metric
2. Instrument code with `this.metrics.record()`
3. Create Grafana panel with appropriate query
4. Update documentation

### Testing Metrics

```bash
# Check metrics endpoint
curl localhost:3333/metrics

# Test Prometheus query
curl 'localhost:9090/api/v1/query?query=up'
```
