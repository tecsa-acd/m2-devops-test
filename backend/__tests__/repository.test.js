// --- Jest Setup: Mocking Modules ---
// 1. Create a mock for the mariaDb repository
const mockMariaDbRepo = { 
    findAll: () => 'MariaDB data',
    type: 'mariaDb'
};

// 2. Create a mock for the filesystem repository
const mockFilesystemRepo = { 
    findAll: () => 'Filesystem data',
    type: 'filesystem'
};

// 3. Mock the actual dependency resolution for 'require'
// When the app tries to 'require' these files, we return our mock objects.
jest.mock('../mariaDbRepository.js', () => mockMariaDbRepo, { virtual: true });
jest.mock('../filesystemRepository.js', () => mockFilesystemRepo, { virtual: true });

// 4. Mock the dotenv config function since it's an external dependency
// We don't want to actually load a .env file during the test.
jest.mock('dotenv', () => ({ 
    config: jest.fn(),
}), { virtual: true });

// 5. Mock the 'path' module used in the .env require call
jest.mock('path', () => ({
    resolve: jest.fn(() => '/mocked/path/.env')
}), { virtual: true });

let consoleLogSpy; 

beforeAll(() => {
    // Spy on console.log and capture its calls
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
    consoleLogSpy.mockRestore(); 
});


describe('Repository Pattern Data Source Implementation', () => {
    
    // Define the path to the module under test
    const REPO_MODULE_PATH = '../repository.js';
    
    // Save the original environment variable so we can restore it later
    const originalEnv = process.env.DB_TYPE;

    // --- Helper Function to Clean Cache and Reload Module ---
    // Since 'require' caches modules, we must clear the cache before 
    // each test to simulate different environment variable settings.
    const loadRepoModule = () => {
        // Clear the cache for the module under test
        delete require.cache[require.resolve(REPO_MODULE_PATH)];
        return require(REPO_MODULE_PATH);
    };

    afterEach(() => {
        // Restore the original environment setting after each test
        process.env.DB_TYPE = originalEnv;
        // Reset all mocks
        jest.resetModules();
        jest.clearAllMocks();
    });

    // --- Test Cases ---

    test('should load filesystemRepository when DB_TYPE is undefined', () => {
        // Arrange: Ensure DB_TYPE is not set (default behavior)
        delete process.env.DB_TYPE;

        // Act: Load the repository module
        const repo = loadRepoModule();

        // Assert
        expect(repo.type).toBe('filesystem');
        expect(repo.findAll()).toBe('Filesystem data');
        
        // Ensure the correct console log was executed (optional but good confirmation)
        expect(console.log).toHaveBeenCalledWith('Loading filesystem as data source at runtime');
    });

    test('should load filesystemRepository when DB_TYPE is set to an unknown value', () => {
        // Arrange: Set DB_TYPE to a non-matching value
        process.env.DB_TYPE = 'unknownDb';

        // Act
        const repo = loadRepoModule();

        // Assert
        expect(repo.type).toBe('filesystem');
        expect(repo.findAll()).toBe('Filesystem data');
        expect(console.log).toHaveBeenCalledWith('Loading filesystem as data source at runtime');
    });
    
    test('should load mariaDbRepository when DB_TYPE is set to "mariaDb"', () => {
        // Arrange: Set DB_TYPE to the specific MariaDB value
        process.env.DB_TYPE = 'mariaDb';

        // Act
        const repo = loadRepoModule();

        // Assert
        expect(repo.type).toBe('mariaDb');
        expect(repo.findAll()).toBe('MariaDB data');
        expect(console.log).toHaveBeenCalledWith('Loading mariaDb data source at runtime');
    });
});