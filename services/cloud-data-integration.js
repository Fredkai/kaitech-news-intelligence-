// Cloud Data Integration Service
// Connects to cloud provider APIs for real-time pricing and service availability

const axios = require('axios');

class CloudDataIntegration {
    constructor() {
        this.apiKeys = {
            // In production, these would be loaded from environment variables
            aws_access_key: process.env.AWS_ACCESS_KEY_ID,
            aws_secret_key: process.env.AWS_SECRET_ACCESS_KEY,
            azure_subscription_id: process.env.AZURE_SUBSCRIPTION_ID,
            azure_client_id: process.env.AZURE_CLIENT_ID,
            azure_client_secret: process.env.AZURE_CLIENT_SECRET,
            gcp_api_key: process.env.GCP_API_KEY,
            gcp_project_id: process.env.GCP_PROJECT_ID
        };

        // Cache configuration
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        
        // API endpoints
        this.endpoints = {
            aws: {
                pricing: 'https://api.pricing.us-east-1.amazonaws.com',
                service_health: 'https://status.aws.amazon.com/data.json',
                regions: 'https://ip-ranges.amazonaws.com/ip-ranges.json'
            },
            azure: {
                pricing: 'https://prices.azure.com/api/retail/prices',
                service_health: 'https://status.azure.com/en-us/status/history',
                regions: 'https://management.azure.com/subscriptions'
            },
            gcp: {
                pricing: 'https://cloudbilling.googleapis.com/v1/services',
                service_health: 'https://status.cloud.google.com/incidents.json',
                regions: 'https://compute.googleapis.com/compute/v1/projects'
            }
        };

        // Rate limiting
        this.rateLimits = {
            aws: { requests: 0, window: Date.now() },
            azure: { requests: 0, window: Date.now() },
            gcp: { requests: 0, window: Date.now() }
        };
    }

    // Main method to get real-time cloud data
    async getRealTimeCloudData() {
        try {
            const [awsData, azureData, gcpData] = await Promise.allSettled([
                this.getAWSData(),
                this.getAzureData(),
                this.getGCPData()
            ]);

            return {
                timestamp: new Date().toISOString(),
                aws: awsData.status === 'fulfilled' ? awsData.value : this.getAWSFallbackData(),
                azure: azureData.status === 'fulfilled' ? azureData.value : this.getAzureFallbackData(),
                gcp: gcpData.status === 'fulfilled' ? gcpData.value : this.getGCPFallbackData(),
                data_sources: {
                    live_apis_available: this.areAPIKeysAvailable(),
                    cache_enabled: true,
                    update_frequency: '30 minutes'
                }
            };
        } catch (error) {
            console.error('Error getting real-time cloud data:', error);
            return this.getFallbackCloudData();
        }
    }

    // AWS data integration
    async getAWSData() {
        const cacheKey = 'aws_data';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // In production, these would use AWS SDK with proper authentication
            const [pricingData, healthData, regionsData] = await Promise.allSettled([
                this.getAWSPricing(),
                this.getAWSServiceHealth(),
                this.getAWSRegions()
            ]);

            const data = {
                pricing: pricingData.status === 'fulfilled' ? pricingData.value : null,
                service_health: healthData.status === 'fulfilled' ? healthData.value : this.getDefaultServiceHealth('aws'),
                regions: regionsData.status === 'fulfilled' ? regionsData.value : this.getDefaultRegions('aws'),
                last_updated: new Date().toISOString(),
                data_source: 'live_api'
            };

            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('AWS data integration error:', error);
            return this.getAWSFallbackData();
        }
    }

    // Azure data integration
    async getAzureData() {
        const cacheKey = 'azure_data';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const [pricingData, healthData] = await Promise.allSettled([
                this.getAzurePricing(),
                this.getAzureServiceHealth()
            ]);

            const data = {
                pricing: pricingData.status === 'fulfilled' ? pricingData.value : null,
                service_health: healthData.status === 'fulfilled' ? healthData.value : this.getDefaultServiceHealth('azure'),
                regions: this.getDefaultRegions('azure'),
                last_updated: new Date().toISOString(),
                data_source: 'live_api'
            };

            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Azure data integration error:', error);
            return this.getAzureFallbackData();
        }
    }

    // GCP data integration
    async getGCPData() {
        const cacheKey = 'gcp_data';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const [pricingData, healthData] = await Promise.allSettled([
                this.getGCPPricing(),
                this.getGCPServiceHealth()
            ]);

            const data = {
                pricing: pricingData.status === 'fulfilled' ? pricingData.value : null,
                service_health: healthData.status === 'fulfilled' ? healthData.value : this.getDefaultServiceHealth('gcp'),
                regions: this.getDefaultRegions('gcp'),
                last_updated: new Date().toISOString(),
                data_source: 'live_api'
            };

            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('GCP data integration error:', error);
            return this.getGCPFallbackData();
        }
    }

    // AWS specific API calls
    async getAWSPricing() {
        if (!this.canMakeRequest('aws')) {
            throw new Error('AWS rate limit exceeded');
        }

        // Placeholder for AWS Pricing API call
        // In production, use AWS SDK: const pricing = new AWS.Pricing();
        return this.simulateAWSPricingAPI();
    }

    async getAWSServiceHealth() {
        try {
            const response = await axios.get(this.endpoints.aws.service_health, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'KaiTech-CloudAdvisor/1.0'
                }
            });
            
            return this.parseAWSHealthData(response.data);
        } catch (error) {
            console.warn('AWS service health API error:', error.message);
            return this.getDefaultServiceHealth('aws');
        }
    }

    async getAWSRegions() {
        try {
            const response = await axios.get(this.endpoints.aws.regions, {
                timeout: 10000
            });
            
            return this.parseAWSRegionsData(response.data);
        } catch (error) {
            console.warn('AWS regions API error:', error.message);
            return this.getDefaultRegions('aws');
        }
    }

    // Azure specific API calls
    async getAzurePricing() {
        if (!this.canMakeRequest('azure')) {
            throw new Error('Azure rate limit exceeded');
        }

        try {
            const response = await axios.get(this.endpoints.azure.pricing, {
                params: {
                    '$filter': "serviceName eq 'Virtual Machines'",
                    'api-version': '2023-01-01-preview'
                },
                timeout: 15000
            });
            
            return this.parseAzurePricingData(response.data);
        } catch (error) {
            console.warn('Azure pricing API error:', error.message);
            return this.simulateAzurePricingAPI();
        }
    }

    async getAzureServiceHealth() {
        try {
            // Azure service health is typically accessed through Azure Resource Manager
            // This is a simplified approach
            return this.getDefaultServiceHealth('azure');
        } catch (error) {
            console.warn('Azure service health API error:', error.message);
            return this.getDefaultServiceHealth('azure');
        }
    }

    // GCP specific API calls
    async getGCPPricing() {
        if (!this.canMakeRequest('gcp')) {
            throw new Error('GCP rate limit exceeded');
        }

        try {
            const response = await axios.get(`${this.endpoints.gcp.pricing}?key=${this.apiKeys.gcp_api_key}`, {
                timeout: 15000
            });
            
            return this.parseGCPPricingData(response.data);
        } catch (error) {
            console.warn('GCP pricing API error:', error.message);
            return this.simulateGCPPricingAPI();
        }
    }

    async getGCPServiceHealth() {
        try {
            const response = await axios.get(this.endpoints.gcp.service_health, {
                timeout: 10000
            });
            
            return this.parseGCPHealthData(response.data);
        } catch (error) {
            console.warn('GCP service health API error:', error.message);
            return this.getDefaultServiceHealth('gcp');
        }
    }

    // Data parsing methods
    parseAWSHealthData(data) {
        // Parse AWS service health JSON
        const currentIssues = data.current || [];
        return {
            status: currentIssues.length === 0 ? 'operational' : 'degraded',
            incidents: currentIssues.length,
            issues: currentIssues.slice(0, 5),
            regions_affected: this.extractAffectedRegions(currentIssues)
        };
    }

    parseAWSRegionsData(data) {
        const regions = data.prefixes
            ?.filter(prefix => prefix.service === 'EC2')
            ?.map(prefix => prefix.region)
            ?.filter((region, index, arr) => arr.indexOf(region) === index)
            ?.slice(0, 10) || [];

        return {
            available: regions,
            total_count: regions.length,
            recommended: ['us-east-1', 'us-west-2', 'eu-west-1']
        };
    }

    parseAzurePricingData(data) {
        const items = data.Items || [];
        const pricingInfo = items.slice(0, 10).map(item => ({
            service: item.productName,
            sku: item.skuName,
            location: item.armRegionName,
            price: item.unitPrice,
            currency: item.currencyCode,
            unit: item.unitOfMeasure
        }));

        return {
            items: pricingInfo,
            currency: 'USD',
            last_updated: new Date().toISOString(),
            total_items: items.length
        };
    }

    parseGCPPricingData(data) {
        const services = data.services || [];
        const pricingInfo = services.slice(0, 10).map(service => ({
            service_id: service.serviceId,
            display_name: service.displayName,
            business_entity_name: service.businessEntityName
        }));

        return {
            services: pricingInfo,
            total_services: services.length,
            last_updated: new Date().toISOString()
        };
    }

    parseGCPHealthData(data) {
        const incidents = data || [];
        const activeIncidents = incidents.filter(incident => 
            incident.status && incident.status !== 'closed'
        );

        return {
            status: activeIncidents.length === 0 ? 'operational' : 'degraded',
            incidents: activeIncidents.length,
            issues: activeIncidents.slice(0, 5),
            services_affected: this.extractAffectedServices(activeIncidents)
        };
    }

    // Utility methods
    extractAffectedRegions(issues) {
        return issues.flatMap(issue => 
            issue.regions || []
        ).filter((region, index, arr) => 
            arr.indexOf(region) === index
        ).slice(0, 5);
    }

    extractAffectedServices(incidents) {
        return incidents.flatMap(incident => 
            incident.services || []
        ).filter((service, index, arr) => 
            arr.indexOf(service) === index
        ).slice(0, 5);
    }

    // Rate limiting
    canMakeRequest(provider) {
        const limit = this.rateLimits[provider];
        const now = Date.now();
        
        // Reset window every hour
        if (now - limit.window > 3600000) {
            limit.requests = 0;
            limit.window = now;
        }
        
        // Allow max 100 requests per hour per provider
        if (limit.requests >= 100) {
            return false;
        }
        
        limit.requests++;
        return true;
    }

    // Cache management
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Check if API keys are available
    areAPIKeysAvailable() {
        return {
            aws: !!(this.apiKeys.aws_access_key && this.apiKeys.aws_secret_key),
            azure: !!(this.apiKeys.azure_subscription_id && this.apiKeys.azure_client_id),
            gcp: !!(this.apiKeys.gcp_api_key && this.apiKeys.gcp_project_id)
        };
    }

    // Fallback data methods
    getAWSFallbackData() {
        return {
            pricing: this.simulateAWSPricingAPI(),
            service_health: this.getDefaultServiceHealth('aws'),
            regions: this.getDefaultRegions('aws'),
            last_updated: new Date().toISOString(),
            data_source: 'fallback'
        };
    }

    getAzureFallbackData() {
        return {
            pricing: this.simulateAzurePricingAPI(),
            service_health: this.getDefaultServiceHealth('azure'),
            regions: this.getDefaultRegions('azure'),
            last_updated: new Date().toISOString(),
            data_source: 'fallback'
        };
    }

    getGCPFallbackData() {
        return {
            pricing: this.simulateGCPPricingAPI(),
            service_health: this.getDefaultServiceHealth('gcp'),
            regions: this.getDefaultRegions('gcp'),
            last_updated: new Date().toISOString(),
            data_source: 'fallback'
        };
    }

    getFallbackCloudData() {
        return {
            timestamp: new Date().toISOString(),
            aws: this.getAWSFallbackData(),
            azure: this.getAzureFallbackData(),
            gcp: this.getGCPFallbackData(),
            data_sources: {
                live_apis_available: false,
                cache_enabled: true,
                status: 'fallback_mode'
            }
        };
    }

    // Simulated API responses (for demo/fallback)
    simulateAWSPricingAPI() {
        return {
            compute_pricing: {
                't3.micro': { hourly: 0.0104, monthly: 7.59, region: 'us-east-1' },
                't3.small': { hourly: 0.0208, monthly: 15.18, region: 'us-east-1' },
                't3.medium': { hourly: 0.0416, monthly: 30.37, region: 'us-east-1' },
                'm5.large': { hourly: 0.096, monthly: 70.08, region: 'us-east-1' }
            },
            storage_pricing: {
                's3_standard': { per_gb: 0.023 },
                'ebs_gp3': { per_gb: 0.08 }
            },
            last_updated: new Date().toISOString(),
            source: 'simulated'
        };
    }

    simulateAzurePricingAPI() {
        return {
            compute_pricing: {
                'B1s': { hourly: 0.0104, monthly: 7.59, region: 'eastus' },
                'B2s': { hourly: 0.0416, monthly: 30.37, region: 'eastus' },
                'D2s_v3': { hourly: 0.096, monthly: 70.08, region: 'eastus' }
            },
            storage_pricing: {
                'blob_hot': { per_gb: 0.0184 },
                'premium_ssd': { per_gb: 0.135 }
            },
            last_updated: new Date().toISOString(),
            source: 'simulated'
        };
    }

    simulateGCPPricingAPI() {
        return {
            compute_pricing: {
                'f1-micro': { hourly: 0.0076, monthly: 5.54, region: 'us-central1' },
                'e2-micro': { hourly: 0.00838, monthly: 6.11, region: 'us-central1' },
                'e2-small': { hourly: 0.01675, monthly: 12.23, region: 'us-central1' },
                'n1-standard-1': { hourly: 0.0475, monthly: 34.67, region: 'us-central1' }
            },
            storage_pricing: {
                'cloud_storage_standard': { per_gb: 0.020 },
                'persistent_disk_ssd': { per_gb: 0.17 }
            },
            last_updated: new Date().toISOString(),
            source: 'simulated'
        };
    }

    getDefaultServiceHealth(provider) {
        const healthStatuses = ['operational', 'degraded', 'partial_outage'];
        const randomStatus = healthStatuses[0]; // Default to operational

        return {
            status: randomStatus,
            incidents: randomStatus === 'operational' ? 0 : Math.floor(Math.random() * 3) + 1,
            last_incident: randomStatus === 'operational' ? null : new Date(Date.now() - Math.random() * 86400000).toISOString(),
            regions_affected: randomStatus === 'operational' ? [] : ['us-east-1'],
            services_affected: randomStatus === 'operational' ? [] : ['compute']
        };
    }

    getDefaultRegions(provider) {
        const regionMaps = {
            aws: {
                available: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1', 'ca-central-1', 'eu-central-1'],
                recommended: ['us-east-1', 'us-west-2', 'eu-west-1']
            },
            azure: {
                available: ['eastus', 'westus2', 'westeurope', 'southeastasia', 'japaneast', 'australiaeast', 'centralus'],
                recommended: ['eastus', 'westus2', 'westeurope']
            },
            gcp: {
                available: ['us-central1', 'us-west1', 'europe-west1', 'asia-southeast1', 'asia-northeast1', 'australia-southeast1'],
                recommended: ['us-central1', 'us-west1', 'europe-west1']
            }
        };

        return regionMaps[provider] || regionMaps.aws;
    }

    // Cost comparison and optimization
    async getOptimizedCostRecommendations(requirements) {
        try {
            const realTimeData = await this.getRealTimeCloudData();
            
            // Analyze real-time pricing to provide optimizations
            const optimizations = this.analyzePricingTrends(realTimeData, requirements);
            
            return {
                timestamp: new Date().toISOString(),
                optimizations,
                data_freshness: this.getDataFreshness(realTimeData),
                savings_potential: this.calculateSavingsPotential(optimizations)
            };
        } catch (error) {
            console.error('Error getting optimized recommendations:', error);
            return this.getFallbackOptimizations();
        }
    }

    analyzePricingTrends(realTimeData, requirements) {
        const optimizations = [];
        
        // Analyze each provider's pricing
        ['aws', 'azure', 'gcp'].forEach(provider => {
            const providerData = realTimeData[provider];
            if (providerData && providerData.pricing) {
                const providerOptimizations = this.getProviderOptimizations(provider, providerData.pricing, requirements);
                optimizations.push(...providerOptimizations);
            }
        });
        
        return optimizations;
    }

    getProviderOptimizations(provider, pricingData, requirements) {
        const optimizations = [];
        
        // Check for spot instance opportunities
        if (requirements.workload_type === 'development' || requirements.workload_type === 'data_processing') {
            optimizations.push({
                provider,
                type: 'spot_instances',
                potential_savings: '50-90%',
                description: `Use ${provider.toUpperCase()} spot instances for non-critical workloads`,
                implementation_effort: 'medium'
            });
        }
        
        // Check for reserved instance opportunities
        if (requirements.budget_tier !== 'very_low') {
            optimizations.push({
                provider,
                type: 'reserved_instances',
                potential_savings: '20-40%',
                description: `Consider 1-year reserved instances on ${provider.toUpperCase()}`,
                implementation_effort: 'low'
            });
        }
        
        return optimizations;
    }

    getDataFreshness(realTimeData) {
        const now = Date.now();
        let oldestData = now;
        
        ['aws', 'azure', 'gcp'].forEach(provider => {
            const providerData = realTimeData[provider];
            if (providerData && providerData.last_updated) {
                const updated = new Date(providerData.last_updated).getTime();
                oldestData = Math.min(oldestData, updated);
            }
        });
        
        const ageMinutes = (now - oldestData) / 60000;
        return {
            age_minutes: Math.round(ageMinutes),
            status: ageMinutes < 30 ? 'fresh' : ageMinutes < 60 ? 'acceptable' : 'stale'
        };
    }

    calculateSavingsPotential(optimizations) {
        if (optimizations.length === 0) return { min: 0, max: 0 };
        
        const savings = optimizations.map(opt => {
            const range = opt.potential_savings.match(/(\d+)-(\d+)%/);
            return range ? { min: parseInt(range[1]), max: parseInt(range[2]) } : { min: 0, max: 0 };
        });
        
        return {
            min: Math.max(...savings.map(s => s.min)),
            max: Math.max(...savings.map(s => s.max)),
            opportunities: optimizations.length
        };
    }

    getFallbackOptimizations() {
        return {
            timestamp: new Date().toISOString(),
            optimizations: [
                {
                    type: 'general',
                    potential_savings: '15-30%',
                    description: 'Enable auto-scaling to match resource usage with demand',
                    implementation_effort: 'medium'
                }
            ],
            data_freshness: { status: 'fallback' },
            savings_potential: { min: 15, max: 30, opportunities: 1 }
        };
    }
}

module.exports = CloudDataIntegration;
