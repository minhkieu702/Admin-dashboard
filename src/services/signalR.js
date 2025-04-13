import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { getId } from './helper';

class SignalRService {
    constructor() {
        this.connection = null;
        this.callbacks = {
            onBookingNotification: null,
            onBookingUpdate: null,
            onBookingCancellation: null,
            onArtistStoreUpdated: null,
            onArtistStoreIsCreated: null,
            onFeedback: null
        };
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
    }

    async startConnection() {
        try {
            if (this.connection) {
                console.log('SignalR connection already exists');
                return;
            }

            console.log('Starting SignalR connection...',);
            
            // Construct the URL with userId as query parameter
            const hubUrl = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/notificationHub?userId=${getId()}`;
            console.log('Connecting to SignalR hub:', hubUrl);

            this.connection = new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    transport: HttpTransportType.WebSockets,
                    skipNegotiation: true,
                    accessTokenFactory: () => localStorage.getItem('token'),
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000])
                .configureLogging(LogLevel.Information)
                .build();

            // Set up connection state handlers
            this.connection.onreconnecting((error) => {
                console.log('SignalR attempting to reconnect...', error);
            });

            this.connection.onreconnected((connectionId) => {
                console.log('SignalR reconnected successfully', { connectionId });
            });

            this.connection.onclose((error) => {
                console.log('SignalR connection closed', error);
            });

            // Set up message handlers
            this.setupMessageHandlers();

            // Start the connection
            await this.connection.start();
            console.log('✅ SignalR Connected Successfully');

            // Request initial data after connection
            await this.connection.invoke('RequestUnreadCount')
                .catch(error => {
                    console.error('Error requesting unread count:', error);
                });

        } catch (error) {
            console.error('❌ Error establishing SignalR connection:', error);
            
            // Implement retry logic
            if (this.retryAttempts < this.maxRetryAttempts) {
                this.retryAttempts++;
                console.log(`Retrying connection... Attempt ${this.retryAttempts} of ${this.maxRetryAttempts}`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                return this.startConnection();
            } else {
                this.retryAttempts = 0;
                throw error;
            }
        }
    }

    setupMessageHandlers() {
        // Booking notifications
        this.connection.on('ReceiveBookingNotification', (title, message, bookingData) => {
            console.log('📬 Received Booking Notification:', { title, message, bookingData });
            if (this.callbacks.onBookingNotification) {
                this.callbacks.onBookingNotification(title, message, bookingData);
            }
        });

        // Booking updates
        this.connection.on('ReceiveBookingUpdate', (title, message, bookingData) => {
            console.log('🔄 Received Booking Update:', { title, message, bookingData });
            if (this.callbacks.onBookingUpdate) {
                this.callbacks.onBookingUpdate(title, message, bookingData);
            }
        });

        // Booking cancellations
        this.connection.on('ReceiveBookingCancellation', (title, message, bookingId) => {
            console.log('❌ Received Booking Cancellation:', { title, message, bookingId });
            if (this.callbacks.onBookingCancellation) {
                this.callbacks.onBookingCancellation(title, message, bookingId);
            }
        });

        this.connection.on('ReceiveArtistStoreUpdated', (title, message) => {
            if(this.callbacks.onArtistStoreUpdated){
                this.callbacks.onArtistStoreUpdated(title,message)
            }
        })

        this.connection.on('ReceiveArtistStoreIsCreated', (title, message) => {
            if(this.callbacks.onArtistStoreIsCreated){
                this.callbacks.onArtistStoreIsCreated(title,message)
            }
        })

        this.connection.on('ReceiveFeedback', (title, message) => {
            if(this.callbacks.onFeedback){
                this.callbacks.onFeedback(title,message)
            }
        })
    }

    // Register callback handlers
    onBookingNotification(callback) {
        console.log(callback);
        
        this.callbacks.onBookingNotification = callback;
    }

    onBookingUpdate(callback) {
        this.callbacks.onBookingUpdate = callback;
    }

    onBookingCancellation(callback) {
        this.callbacks.onBookingCancellation = callback;
    }

    onArtistStoreUpdated(callback) {
        this.callbacks.onArtistStoreUpdated = callback;
    }

    onArtistStoreIsCreated(callback) {
        this.callbacks.onArtistStoreIsCreated = callback;
    }

    onFeedback(callback) {
        this.callbacks.onFeedback = callback;
    }

    // Stop connection
    async stopConnection() {
        if (this.connection) {
            try {
                await this.connection.stop();
                this.connection = null;
                this.retryAttempts = 0;
                console.log('🔴 SignalR Disconnected');
            } catch (error) {
                console.error('❌ Error stopping SignalR connection:', error);
            }
        }
    }
}

const signalRService = new SignalRService();
export default signalRService;
