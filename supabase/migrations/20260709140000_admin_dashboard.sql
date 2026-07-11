-- ============================================================================
-- Yasso Store — admin_dashboard_stats()
-- Aggregate read model for the admin dashboard: catalog counts, order counts,
-- revenue, the five most recent orders and the best-selling products.
--
-- SECURITY DEFINER so the dashboard can read RLS-protected tables through one
-- narrow, aggregate-only surface. NOTE: until admin authentication ships in a
-- later phase, this function is callable with the public key — restrict the
-- grant to authenticated admins once auth exists.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

create or replace function public.admin_dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_products',   (select count(*) from products),
    'total_categories', (select count(*) from categories),
    'total_customers',  (select count(*) from customers),
    'total_orders',     (select count(*) from orders),
    'total_revenue',    coalesce((select sum(total) from orders where status <> 'cancelled'), 0),

    'recent_orders', coalesce((
      select jsonb_agg(row_to_json(recent))
      from (
        select
          o.order_number,
          coalesce(c.full_name, '—')           as customer_name,
          o.shipping_city,
          o.shipping_method,
          o.status,
          o.total,
          o.created_at,
          (select count(*)::int from order_items oi where oi.order_id = o.id) as item_count
        from orders o
        left join customers c on c.id = o.customer_id
        order by o.created_at desc
        limit 5
      ) recent
    ), '[]'::jsonb),

    'best_sellers', coalesce((
      select jsonb_agg(row_to_json(best))
      from (
        select
          oi.product_name,
          p.slug,
          (
            select pi.url from product_images pi
            where pi.product_id = p.id
            order by pi.sort_order
            limit 1
          )                                     as image_url,
          sum(oi.quantity)::int                 as units_sold,
          sum(oi.quantity * oi.unit_price)      as revenue
        from order_items oi
        left join products p on p.id = oi.product_id
        group by oi.product_name, p.slug, p.id
        order by units_sold desc, revenue desc
        limit 5
      ) best
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to anon, authenticated;

-- Make PostgREST pick up the new function immediately.
notify pgrst, 'reload schema';
