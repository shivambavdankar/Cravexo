import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const { data: cart, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_email', email.toLowerCase())
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json({ cart }, { status: 200 });
  } catch (err) {
    console.error('[Cart GET] error:', err);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, item } = await req.json();

    if (!email || !item || !item.food_item_name) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Check if exactly same item is already in cart
    const { data: existing, error: findError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_email', email.toLowerCase())
      .eq('food_item_name', item.food_item_name)
      .eq('restaurant_name', item.restaurant_name || '') // treating nulls securely if possible
      .eq('restaurant_location', item.restaurant_location || '')
      .single();

    if (existing) {
      // Increment quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      // Enforce max count of 10 distinct items
      const { count } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', email.toLowerCase());

      if (count !== null && count >= 10) {
        return NextResponse.json({ error: 'Cart is full. Maximum 10 items allowed.' }, { status: 400 });
      }

      // Create new
      await supabase
        .from('cart_items')
        .insert({
          user_email: email.toLowerCase(),
          food_item_name: item.food_item_name,
          restaurant_name: item.restaurant_name || '',
          restaurant_location: item.restaurant_location || '',
          price: item.price || null,
          image_url: item.image_url || null,
          cuisine: item.cuisine || null,
          metadata: item.metadata || {},
          quantity: 1
        });
    }

    // Return the updated full cart
    const { data: allCart } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_email', email.toLowerCase())
      .order('created_at', { ascending: true });

    return NextResponse.json({ cart: allCart }, { status: 200 });
  } catch (err) {
    console.error('[Cart POST] error:', err);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, item_id, quantity } = await req.json();

    if (!email || !item_id || quantity === undefined) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (quantity <= 0) {
      // Delete
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', item_id)
        .eq('user_email', email.toLowerCase());
    } else {
      // Update
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', item_id)
        .eq('user_email', email.toLowerCase());
    }

    // Return updated full cart
    const { data: allCart } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_email', email.toLowerCase())
      .order('created_at', { ascending: true });

    return NextResponse.json({ cart: allCart }, { status: 200 });
  } catch (err) {
    console.error('[Cart PATCH] error:', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
