import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, ContextTypes, ConversationHandler, filters
from tinydb import TinyDB, Query

# --- CONFIGURATION ---
TOKEN = "8572137957:AAH_tYEXSYKjcSo_YUpNjc91H5I4oA9UtPY"
ADMIN_ID = 999999999  # <--- REPLACE THIS WITH YOUR ID FROM @userinfobot
CHANNEL_USERNAME = "@DigitalBlitzMM" # <--- REPLACE WITH YOUR ACTUAL CHANNEL NAME
KPAY_INFO = "09675214407 (Daw Khine Zar Zar Thin)"
COURSE_FEE = 25000
REFERRAL_REWARD = 5000
MIN_WITHDRAW = 10000

# Database Setup
db = TinyDB('users_db.json')
User = Query()

# States for Withdrawal
ASK_METHOD, ASK_AMOUNT = range(2)

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# --- DATABASE HELPER ---
def get_or_create_user(user_id, username, referrer=None):
    res = db.search(User.user_id == user_id)
    if not res:
        db.insert({
            'user_id': user_id,
            'username': username,
            'balance': 0,
            'withdrawn': 0,
            'referred_by': referrer,
            'total_referrals': 0,
            'successful_sales': 0
        })
        if referrer:
            ref_user = db.search(User.user_id == int(referrer))
            if ref_user:
                db.update({'total_referrals': ref_user[0]['total_referrals'] + 1}, User.user_id == int(referrer))
        return db.search(User.user_id == user_id)[0]
    return res[0]

# --- HANDLERS ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    username = update.effective_user.username
    
    referrer = context.args[0] if context.args and context.args[0].isdigit() else None
    if referrer and int(referrer) == user_id: referrer = None

    get_or_create_user(user_id, username, referrer)
    
    # Force Join Check
    try:
        member = await context.bot.get_chat_member(chat_id=CHANNEL_USERNAME, user_id=user_id)
        if member.status in ['left', 'kicked']:
            keyboard = [[InlineKeyboardButton("📢 Join Channel", url=f"https://t.me/{CHANNEL_USERNAME[1:]}")],
                        [InlineKeyboardButton("✅ Verify Join", callback_data="verify")]]
            await update.message.reply_text(f"🎉 Welcome to 💸 Earn Bot Myanmar! 🇲🇲\n\nTo start earning, please join our channel first 👇", reply_markup=InlineKeyboardMarkup(keyboard))
            return
    except:
        pass 

    await show_main_menu(update)

async def show_main_menu(update):
    keyboard = [['💰 Wallet', '🔗 Affiliate'], ['👤 My Account', '📚 Course Info'], ['💵 Withdrawal', '📞 Support']]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    text = "💸 *Turn Your Telegram Into Income* 🇲🇲\n\nInvite friends and earn 5,000 MMK per sale!\nChoose an option below:"
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode='Markdown')
    else:
        await update.callback_query.message.reply_text(text, reply_markup=reply_markup, parse_mode='Markdown')

async def handle_buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    user_id = update.effective_user.id
    u_data = db.search(User.user_id == user_id)[0]

    if text == '💰 Wallet':
        await update.message.reply_text(f"💰 *Your Wallet*\n\n💵 Total Earned: {u_data['balance'] + u_data['withdrawn']} MMK\n💸 Withdrawn: {u_data['withdrawn']} MMK\n🪙 Available: {u_data['balance']} MMK\n\n📌 Min Withdrawal: 10,000 MMK", parse_mode='Markdown')
    
    elif text == '🔗 Affiliate':
        bot_name = (await context.bot.get_me()).username
        link = f"https://t.me/{bot_name}?start={user_id}"
        await update.message.reply_text(f"🔗 *Your Affiliate Link*\n`{link}`\n\nShare this! Earn 5,000 MMK when someone buys the course.", parse_mode='Markdown')

    elif text == '👤 My Account':
        await update.message.reply_text(f"👤 *My Account*\n\n🆔 User ID: `{user_id}`\n👥 Total Referrals: {u_data['total_referrals']}\n✅ Success Sales: {u_data['successful_sales']}", parse_mode='Markdown')

    elif text == '📚 Course Info':
        await update.message.reply_text(f"📚 *Digital Blitz VIP Course*\n\n✅ Digital Marketing\n✅ AI Creation\n✅ Telegram Growth\n\n💰 Fee: {COURSE_FEE} MMK\n\n🏦 *Payment Details:*\nKPay: {KPAY_INFO}\n\n📩 After paying, send a screenshot to @YourAdminUsername", parse_mode='Markdown')

# --- ADMIN COMMANDS ---
async def approve_sale(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID: return
    try:
        buyer_id = int(context.args[0])
        buyer = db.search(User.user_id == buyer_id)[0]
        referrer_id = buyer['referred_by']
        
        db.update({'successful_sales': buyer['successful_sales'] + 1}, User.user_id == buyer_id)
        
        if referrer_id:
            ref_id = int(referrer_id)
            ref_data = db.search(User.user_id == ref_id)[0]
            db.update({'balance': ref_data['balance'] + REFERRAL_REWARD}, User.user_id == ref_id)
            await context.bot.send_message(chat_id=ref_id, text=f"💸 *Success!* You earned {REFERRAL_REWARD} MMK from a referral purchase!", parse_mode='Markdown')
        
        await update.message.reply_text(f"✅ Sale Approved for ID: {buyer_id}")
    except:
        await update.message.reply_text("Usage: /approve [user_id]")

# --- WITHDRAWAL FLOW ---
async def start_withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE):
    u_data = db.search(User.user_id == update.effective_user.id)[0]
    if u_data['balance'] < MIN_WITHDRAW:
        await update.message.reply_text(f"❌ Minimum withdrawal is {MIN_WITHDRAW} MMK.")
        return ConversationHandler.END
    await update.message.reply_text("🏦 Please enter your KBZPay or WavePay number:")
    return ASK_METHOD

async def get_method(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['method'] = update.message.text
    await update.message.reply_text("💰 How much would you like to withdraw?")
    return ASK_AMOUNT

async def get_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        amount = int(update.message.text)
        user_id = update.effective_user.id
        u_data = db.search(User.user_id == user_id)[0]
        
        if amount > u_data['balance']:
            await update.message.reply_text("❌ Insufficient balance.")
            return ConversationHandler.END

        await context.bot.send_message(chat_id=ADMIN_ID, text=f"🚨 *Withdraw Request*\nID: `{user_id}`\nAmount: {amount} MMK\nDetails: {context.user_data['method']}", parse_mode='Markdown')
        await update.message.reply_text("✅ Request sent! Admin will process it soon.")
    except:
        await update.message.reply_text("❌ Invalid amount.")
    return ConversationHandler.END

def main():
    app = Application.builder().token(TOKEN).build()
    
    withdraw_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Text('💵 Withdrawal'), start_withdraw)],
        states={
            ASK_METHOD: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_method)],
            ASK_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_amount)],
        },
        fallbacks=[]
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("approve", approve_sale))
    app.add_handler(withdraw_conv)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_buttons))
    app.add_handler(CallbackQueryHandler(start, pattern="verify"))

    print("Earn Bot Myanmar is running...")
    app.run_polling()

if __name__ == '__main__':
    main()
