// Subscription middleware
export const checkBuyerSubscription = async (req, res, next) => {
    try {
        if (req.user.role !== 'buyer') {
            return next(); // Skip for non-buyers (e.g. admin/farmer)
        }

        // Allow access to subscription plan/status endpoints/dashboard stats so they can subscribe
        const allowedPaths = [
            '/api/buyer/subscription/status',
            '/api/buyer/subscription/plans',
            '/api/buyer/subscription/subscribe',
            '/api/buyer/stats',
            '/api/buyer/featured-crops',
            '/api/buyer/browse-crops'
        ];

        if (allowedPaths.some(path => req.originalUrl.includes(path))) {
            return next();
        }

        // Check if subscription is active
        if (!req.user.isSubscribed) {
            return res.status(403).json({
                message: 'Subscription required',
                code: 'SUBSCRIPTION_REQUIRED',
                requiresSubscription: true
            });
        }

        // Check expiry
        if (req.user.subscriptionEnd && new Date() > new Date(req.user.subscriptionEnd)) {
            // Auto-expire in DB (optional, but good for data consistency)
            // For now, just block access
            return res.status(403).json({
                message: 'Subscription expired',
                code: 'SUBSCRIPTION_EXPIRED',
                requiresSubscription: true
            });
        }

        next();
    } catch (error) {
        console.error('Subscription check error', error);
        res.status(500).json({ message: 'Internal server error checking subscription' });
    }
};
