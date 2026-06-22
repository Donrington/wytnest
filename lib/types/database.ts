export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlanTier = 'free' | 'starter' | 'growth' | 'agency'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
export type TestimonialType = 'video' | 'text'
export type TestimonialStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type WidgetLayout = 'bento_wall' | 'cinematic_slider' | 'ticker'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived'
export type CurrencyCode = 'NGN' | 'USD'
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member'

// ── Layout config shapes ─────────────────────────────────────

export interface BentoWallConfig {
  columns: 2 | 3 | 4
  gap: number
  animation: 'fade' | 'slide' | 'scale'
}

export interface CinematicSliderConfig {
  autoplay: boolean
  interval: number
  scrub: boolean
}

export interface TickerConfig {
  speed: number
  direction: 'left' | 'right'
  pauseOnHover: boolean
  gap: number
}

export type LayoutConfig = BentoWallConfig | CinematicSliderConfig | TickerConfig

// ── Table row types ──────────────────────────────────────────

export interface Workspace {
  id: string
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  brand_color: string
  custom_domain: string | null
  plan: PlanTier
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_end: string | null
  paystack_customer_id: string | null
  stripe_customer_id: string | null
  currency: CurrencyCode
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  invited_at: string
  accepted_at: string | null
}

export interface Campaign {
  id: string
  workspace_id: string
  name: string
  slug: string
  status: CampaignStatus
  prompt_heading: string
  prompt_body: string | null
  allow_video: boolean
  allow_text: boolean
  max_video_seconds: number
  thank_you_message: string | null
  redirect_url: string | null
  email_subject: string | null
  email_body: string | null
  reminder_days: number | null
  created_at: string
  updated_at: string
}

export interface SubmissionToken {
  id: string
  campaign_id: string
  workspace_id: string
  token: string
  customer_email: string | null
  customer_name: string | null
  used_at: string | null
  expires_at: string
  reminder_sent_at: string | null
  created_at: string
}

export interface Testimonial {
  id: string
  workspace_id: string
  campaign_id: string | null
  submission_token_id: string | null
  submitter_name: string
  submitter_email: string | null
  submitter_role: string | null
  submitter_company: string | null
  submitter_avatar_url: string | null
  submitter_rating: number | null
  type: TestimonialType
  text_content: string | null
  video_r2_key: string | null
  video_stream_id: string | null
  video_playback_url: string | null
  video_thumbnail_url: string | null
  video_duration_seconds: number | null
  transcript: string | null
  ai_highlight: string | null
  status: TestimonialStatus
  is_featured: boolean
  is_pinned: boolean
  moderated_at: string | null
  moderated_by: string | null
  rejection_reason: string | null
  display_order: number
  source_url: string | null
  ip_country: string | null
  created_at: string
  updated_at: string
}

export interface Widget {
  id: string
  workspace_id: string
  public_id: string
  name: string
  layout: WidgetLayout
  theme: 'light' | 'dark' | 'auto'
  accent_color: string | null
  font_family: string
  border_radius: number
  show_rating: boolean
  show_avatar: boolean
  show_company: boolean
  show_date: boolean
  campaign_ids: string[] | null
  min_rating: number
  max_items: number
  testimonial_type_filter: TestimonialType | null
  show_wytnest_badge: boolean
  layout_config: LayoutConfig
  custom_css: string | null
  created_at: string
  updated_at: string
}

export interface WidgetEvent {
  id: string
  widget_id: string
  workspace_id: string
  testimonial_id: string | null
  event_type: 'impression' | 'video_play' | 'video_complete' | 'click' | 'conversion'
  session_id: string | null
  page_url: string | null
  referrer: string | null
  country: string | null
  created_at: string
}

export interface Subscription {
  id: string
  workspace_id: string
  plan: PlanTier
  status: SubscriptionStatus
  currency: CurrencyCode
  amount_minor: number
  interval: 'monthly' | 'annual'
  provider: 'paystack' | 'stripe'
  provider_sub_id: string | null
  provider_plan_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceUsage {
  workspace_id: string
  plan: PlanTier
  approved_count: number
  widget_count: number
  testimonial_limit: number | null
  widget_limit: number
}

// ── Enriched / joined types for UI ──────────────────────────

export interface TestimonialWithCampaign extends Testimonial {
  campaign: Pick<Campaign, 'id' | 'name' | 'slug'> | null
}

export interface WidgetWithWorkspace extends Widget {
  workspace: Pick<Workspace, 'id' | 'name' | 'brand_color' | 'logo_url' | 'plan'>
}

// ── Widget embed payload (returned by Edge Function) ─────────

export interface WidgetEmbedPayload {
  widget: Widget
  testimonials: Array<Pick<Testimonial,
    | 'id'
    | 'submitter_name'
    | 'submitter_role'
    | 'submitter_company'
    | 'submitter_avatar_url'
    | 'submitter_rating'
    | 'type'
    | 'text_content'
    | 'video_playback_url'
    | 'video_thumbnail_url'
    | 'video_duration_seconds'
    | 'transcript'
    | 'display_order'
    | 'created_at'
  >>
  workspace: Pick<Workspace, 'brand_color' | 'logo_url'>
}

// ── Plan limits ──────────────────────────────────────────────

export const PLAN_LIMITS: Record<PlanTier, {
  testimonials: number | null
  widgets: number
  campaigns: number
  videoAllowed: boolean
  whiteLabelAllowed: boolean
  customCssAllowed: boolean
  subAccountsAllowed: boolean
  apiAccessAllowed: boolean
  workspaces: number
}> = {
  free: {
    testimonials: 5,
    widgets: 1,
    campaigns: 1,
    videoAllowed: false,
    whiteLabelAllowed: false,
    customCssAllowed: false,
    subAccountsAllowed: false,
    apiAccessAllowed: false,
    workspaces: 1,
  },
  starter: {
    testimonials: 50,
    widgets: 2,
    campaigns: 5,
    videoAllowed: false,
    whiteLabelAllowed: false,
    customCssAllowed: false,
    subAccountsAllowed: false,
    apiAccessAllowed: false,
    workspaces: 1,
  },
  growth: {
    testimonials: null,
    widgets: 10,
    campaigns: 20,
    videoAllowed: true,
    whiteLabelAllowed: true,
    customCssAllowed: false,
    subAccountsAllowed: false,
    apiAccessAllowed: false,
    workspaces: 1,
  },
  agency: {
    testimonials: null,
    widgets: 50,
    campaigns: 100,
    videoAllowed: true,
    whiteLabelAllowed: true,
    customCssAllowed: true,
    subAccountsAllowed: true,
    apiAccessAllowed: true,
    workspaces: 10,
  },
}

// ── Pricing (display) ────────────────────────────────────────

export const PRICING = {
  NGN: {
    free:    { monthly: 0,      annual: 0       },
    starter: { monthly: 15_000, annual: 144_000 },
    growth:  { monthly: 35_000, annual: 336_000 },
    agency:  { monthly: 80_000, annual: 768_000 },
  },
  USD: {
    free:    { monthly: 0,     annual: 0      },
    starter: { monthly: 9_00,  annual: 86_40  },
    growth:  { monthly: 29_00, annual: 278_40 },
    agency:  { monthly: 79_00, annual: 758_40 },
  },
} satisfies Record<CurrencyCode, Record<PlanTier, { monthly: number; annual: number }>>
